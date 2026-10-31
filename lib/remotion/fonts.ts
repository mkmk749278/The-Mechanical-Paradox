import {loadFont} from '@remotion/fonts';
import {continueRender, delayRender, staticFile} from 'remotion';
import {fonts} from './brand';

// Vendored OFL fonts from public/fonts (PLAYBOOK §10.2): never fetched at render time.
const faces: {family: string; file: string; weight: string; stretch?: string; unicodeRange?: string}[] = [
	{family: fonts.display, file: 'fonts/Archivo-Variable.woff2', weight: '100 900', stretch: '62% 125%'},
	{family: fonts.text, file: 'fonts/Inter-400.woff2', weight: '400'},
	{family: fonts.text, file: 'fonts/Inter-500.woff2', weight: '500'},
	{family: fonts.text, file: 'fonts/Inter-600.woff2', weight: '600'},
	{family: fonts.text, file: 'fonts/Inter-700.woff2', weight: '700'},
	{family: fonts.mono, file: 'fonts/JetBrainsMono-400.woff2', weight: '400'},
	{family: fonts.mono, file: 'fonts/JetBrainsMono-500.woff2', weight: '500'},
	{family: fonts.mono, file: 'fonts/JetBrainsMono-700.woff2', weight: '700'},
	{family: fonts.mono, file: 'fonts/JetBrainsMono-greek-500.woff2', weight: '500', unicodeRange: 'U+0370-03FF'},
	{family: fonts.mono, file: 'fonts/JetBrainsMono-greek-700.woff2', weight: '700', unicodeRange: 'U+0370-03FF'},
];

let loaded = false;

/** Call once at module level in Root.tsx. Holds the first frame until every face is ready. */
export const loadBrandFonts = (): void => {
	if (loaded) return;
	loaded = true;
	const handle = delayRender('brand fonts');
	Promise.all(
		faces.map((f) =>
			loadFont({
				family: f.family,
				url: staticFile(f.file),
				weight: f.weight,
				...(f.stretch ? {stretch: f.stretch} : {}),
				...(f.unicodeRange ? {unicodeRange: f.unicodeRange} : {}),
			}),
		),
	)
		.then(() => continueRender(handle))
		.catch((err: unknown) => {
			throw err instanceof Error ? err : new Error(String(err));
		});
};

export const fontStacks = {
	display: `'${fonts.display}', 'Arial Black', sans-serif`,
	text: `'${fonts.text}', Arial, sans-serif`,
	mono: `'${fonts.mono}', 'Courier New', monospace`,
} as const;
