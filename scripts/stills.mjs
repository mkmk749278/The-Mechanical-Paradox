// Render many stills of one or more compositions from a single bundle (PLAYBOOK §10 loop: look at every image).
// Usage: node scripts/stills.mjs OUT_DIR COMP:f1,f2,f3 [COMP:f…] [--scale 0.5]
// Frames may be negative (counted from the end). Writes OUT_DIR/<COMP>_<frame>.jpg and prints each path.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const args = process.argv.slice(2);
const scaleAt = args.indexOf('--scale');
const scale = scaleAt >= 0 ? Number(args.splice(scaleAt, 2)[1]) : 1;
const [out, ...jobs] = args;
if (!out || jobs.length === 0) {
	console.error('usage: stills.mjs OUT_DIR COMP:f1,f2 [COMP:f…] [--scale 0.5]');
	process.exit(2);
}
mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: resolve('src/index.ts'), publicDir: resolve('public')});
for (const job of jobs) {
	const [id, list] = job.split(':');
	const comp = await selectComposition({serveUrl, id, chromiumOptions: {gl: 'swangle'}});
	for (const raw of list.split(',')) {
		const n = Number(raw);
		const frame = n < 0 ? comp.durationInFrames + n : n;
		const output = resolve(out, `${id}_${frame}.jpg`);
		await renderStill({composition: comp, serveUrl, frame, output, scale, imageFormat: 'jpeg', jpegQuality: 90, chromiumOptions: {gl: 'swangle'}});
		console.log(output);
	}
}
