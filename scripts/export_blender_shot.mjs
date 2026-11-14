// Export one Blender hero shot (meshes + per-frame camera and poses) from a film's picture code to JSON for
// blender/render_shot.py. The picture code is the single source: the plate matches the three.js layer it replaces.
// Usage: node scripts/export_blender_shot.mjs <module exporting exportShot(id)> <shot id> <out.json>
import {build} from 'esbuild';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [mod, id, outFile] = process.argv.slice(2);
if (!outFile) {
	console.error('usage: export_blender_shot.mjs MODULE SHOT OUT.json');
	process.exit(2);
}
const out = resolve('.cache/blender_export.mjs');
mkdirSync('.cache', {recursive: true});
await build({entryPoints: [resolve(mod)], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error',
	jsx: 'automatic', loader: {'.ts': 'ts', '.tsx': 'tsx'}, define: {'process.env.NODE_ENV': '"production"'}});
globalThis.window = globalThis.window ?? undefined;
const m = await import(pathToFileURL(out).href);
const data = m.exportShot(id);
mkdirSync(dirname(resolve(outFile)), {recursive: true});
writeFileSync(resolve(outFile), JSON.stringify(data));
console.log(`${id}: ${data.frames.length} frames${data.wheelset ? `, ${data.wheelset.length} wheelset meshes` : ""} → ${outFile}`);
