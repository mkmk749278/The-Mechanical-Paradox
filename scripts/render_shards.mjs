#!/usr/bin/env node
// Render a composition in shards, bundled once (PLAYBOOK §10.5): each shard is written to tmp_* and renamed when
// complete, finished shards are skipped on a restart (worker restarts kill long renders), then the shards are joined
// with `ffmpeg -f concat -c copy` and, if given, the master audio is laid under the picture.
//
// Usage: node scripts/render_shards.mjs . COMP OUT_DIR [--seconds 30] [--scale 1] [--crf 18]
//          [--concurrency 4] [--audio MIX.wav] [--maxrate 16M] [--out FILM.mp4] [--frames A-B] [--render-only] [--join-only]
// Shards are encoded with a capped bitrate (--maxrate), so the join never re-encodes: concat + audio in one copy pass.
// The render farm (.github/workflows/remotion-render.yml) gives each runner --frames A-B --render-only, then one job
// runs --join-only on all the shards.
// Start long renders detached: setsid nohup node scripts/render_shards.mjs … > log 2>&1 < /dev/null & disown
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [project, comp, out, ...rest] = process.argv.slice(2);
if (!out) {
	console.error('usage: render_shards.mjs PROJECT COMP OUT_DIR [--seconds S] [--scale K] [--crf N] [--concurrency C] [--audio WAV] [--maxrate R] [--out MP4]');
	process.exit(2);
}
const opt = (name, def) => {
	const i = rest.indexOf(`--${name}`);
	return i >= 0 ? rest[i + 1] : def;
};
const seconds = Number(opt('seconds', 30));
// A fraction ("2/3") gives an exact scale: 1920×1080 × 2/3 = 1280×720. A rounded decimal (0.6666667) gives 720.00004
// and Remotion refuses a non-integer frame size (run 40675765062, 2026-10-28).
const scaleArg = String(opt('scale', 1));
const scale = scaleArg.includes('/') ? Number(scaleArg.split('/')[0]) / Number(scaleArg.split('/')[1]) : Number(scaleArg);
const crf = Number(opt('crf', 18));
const concurrency = Number(opt('concurrency', 4));
const audio = opt('audio', null);
const maxrate = opt('maxrate', scale > 1 ? '30M' : '12M');
const only = opt('frames', null)?.split('-').map(Number);
const final = opt('out', path.join(out, `${comp}.mp4`));

const req = createRequire(path.resolve(project, 'package.json'));
const {bundle} = req('@remotion/bundler');
const {selectComposition, renderMedia} = req('@remotion/renderer');

fs.mkdirSync(out, {recursive: true});
// One workspace (The Mechanical Paradox): lib/ sits inside the project, so it resolves from the root node_modules.
const webpackOverride = (config) => ({...config, resolve: {...config.resolve, modules: [path.resolve(project, 'node_modules'), 'node_modules']}});
const serveUrl = await bundle({entryPoint: path.resolve(project, 'src/index.ts'), publicDir: path.resolve(project, 'public'), webpackOverride});
const chromiumOptions = {gl: 'swangle'};
const composition = await selectComposition({serveUrl, id: comp, chromiumOptions});
const per = Math.round(seconds * composition.fps);
const total = composition.durationInFrames;
const shards = [];
for (let a = 0; a < total; a += per) shards.push([a, Math.min(total, a + per) - 1]);
console.log(`${comp}: ${total} frames, ${shards.length} shards of ${per}, scale ${scale}`);

/** Frames (0-based in `file`) darker than 45 % of both neighbours, on 64×36 mean luma (the picture-gate test). */
const flashes = (file) => {
	const y = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-an', '-vf', 'scale=64:36,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'], {maxBuffer: 1 << 28})
		.toString()
		.split('\n')
		.filter((l) => l.includes('YAVG'))
		.map((l) => Number(l.split('=')[1]));
	const dark = (v, a, b) => a > 12 && b > 12 && v < 0.45 * a && v < 0.45 * b;
	const bad = [];
	for (let i = 1; i < y.length - 1; i++) {
		if (dark(y[i], y[i - 1], y[i + 1])) bad.push(i); // one frame
		else if (i < y.length - 2 && dark(Math.max(y[i], y[i + 1]), y[i - 1], y[i + 2])) bad.push(i); // two frames
	}
	return bad;
};

for (const [a, b] of rest.includes('--join-only') ? [] : shards) {
	if (only && (a < only[0] || a > only[1])) continue;
	const name = `shard_${String(a).padStart(6, '0')}.mp4`;
	const file = path.join(out, name);
	if (fs.existsSync(file)) continue;
	const tmp = path.join(out, `tmp_${name}`);
	const t0 = Date.now();
	// A frame captured before its image or 3D canvas was ready comes out as one near-black frame between two lit ones
	// (v8 720p: 28 of them). Every shard is measured; a shard with a flash is rendered again, then the film fails loud.
	for (let attempt = 1; ; attempt++) {
		await renderMedia({
			serveUrl, composition, codec: 'h264', outputLocation: tmp, frameRange: [a, b], scale, crf,
			concurrency: attempt === 1 ? concurrency : 1,
			muted: true, chromiumOptions, x264Preset: 'medium', pixelFormat: 'yuv420p',
			encodingMaxRate: maxrate, encodingBufferSize: `${parseInt(maxrate) * 2}M`,
		});
		const bad = flashes(tmp);
		if (!bad.length) break;
		console.log(`shard ${a}-${b}: dark flash at frame ${bad.map((i) => a + i).join(', ')} (attempt ${attempt})`);
		if (attempt === 2) throw new Error(`shard ${a}-${b} still has dark flash frames: ${bad.map((i) => a + i).join(', ')}`);
	}
	fs.renameSync(tmp, file);
	console.log(`shard ${a}-${b} ${((Date.now() - t0) / (b - a + 1)).toFixed(0)} ms/frame`);
}

if (rest.includes('--render-only')) process.exit(0);

// join and lay the audio under the picture in one copy pass (the shards already carry the bitrate cap), then check
const list = path.join(out, 'shards.txt');
fs.writeFileSync(list, shards.map(([a]) => `file 'shard_${String(a).padStart(6, '0')}.mp4'\n`).join(''));
const missing = shards.filter(([a]) => !fs.existsSync(path.join(out, `shard_${String(a).padStart(6, '0')}.mp4`)));
if (missing.length) throw new Error(`missing shards: ${missing.map(([a]) => a).join(', ')}`);
const args = ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list];
if (audio) args.push('-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '320k', '-ac', '2', '-shortest');
args.push('-c:v', 'copy', '-movflags', '+faststart', final);
execFileSync('ffmpeg', args);
const probe = (stream) => Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', stream, '-show_entries', 'stream=duration', '-of', 'csv=p=0', final]).toString());
const want = total / composition.fps;
const v = probe('v:0');
console.log(`picture ${v.toFixed(2)} s, composition ${want.toFixed(2)} s${audio ? `, sound ${probe('a:0').toFixed(2)} s` : ''}`);
if (Math.abs(v - want) > 0.15) throw new Error('picture length does not match the composition');
if (audio && Math.abs(probe('a:0') - v) > 0.15) throw new Error('sound and picture lengths differ');
console.log('wrote', final);
