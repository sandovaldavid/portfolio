import jetBrainsMonoBoldUrl from '../../../assets/fonts/jetbrains-mono-700.woff2?inline';
import silkscreenBoldUrl from '../../../assets/fonts/silkscreen-700.woff2?inline';
import sharp from 'sharp';

export type BrandMode = 'light' | 'dark';

const PALETTES = {
	light: {
		background: '#F5F8FC',
		border: '#E2E8F0',
		primary: '#0044CC',
		secondary: '#1E40AF',
		accent: '#00B0FF',
		text: '#0F172A',
		muted: '#475569',
	},
	dark: {
		background: '#020408',
		border: '#1E293B',
		primary: '#00B0FF',
		secondary: '#3B82F6',
		accent: '#00D8FF',
		text: '#F1F5F9',
		muted: '#94A3B8',
	},
} as const;

const FONT_CSS = `
	@font-face {
		font-family: 'JetBrains Mono';
		src: url('${jetBrainsMonoBoldUrl}') format('woff2');
		font-weight: 700;
		font-style: normal;
	}
	@font-face {
		font-family: 'Silkscreen';
		src: url('${silkscreenBoldUrl}') format('woff2');
		font-weight: 700;
		font-style: normal;
	}
`;

const logoGeometry = (mode: BrandMode): string => {
	const palette = PALETTES[mode];
	return `
		<circle cx="256" cy="256" r="210" stroke="${palette.primary}" stroke-width="28"/>
		<path d="M190 170L104 256L190 342" stroke="${palette.secondary}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M322 170L408 256L322 342" stroke="${palette.secondary}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M286 120L226 392" stroke="${palette.secondary}" stroke-width="42" stroke-linecap="round"/>
		<mask id="slash-accent-${mode}" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="140" y="245" width="210" height="215">
			<path d="M160 245L330 315L350 460H140L160 245Z" fill="white"/>
		</mask>
		<g mask="url(#slash-accent-${mode})">
			<path d="M286 120L226 392" stroke="${palette.accent}" stroke-width="42" stroke-linecap="round"/>
		</g>
	`;
};

const createOpenGraphSvg = (mode: BrandMode): string => {
	const palette = PALETTES[mode];

	return `
		<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
			<style>${FONT_CSS}</style>
			<rect width="1200" height="630" fill="${palette.background}"/>
			<rect width="18" height="630" fill="${palette.primary}"/>
			<rect x="80" y="444" width="620" height="4" fill="${palette.border}"/>
			<text x="80" y="124" fill="${palette.accent}" font-family="Silkscreen, monospace" font-size="18" font-weight="700" letter-spacing="1">PERSONAL SOFTWARE ENGINEERING PORTFOLIO</text>
			<text x="76" y="285" fill="${palette.text}" font-family="JetBrains Mono, monospace" font-size="72" font-weight="700" letter-spacing="-2">DAVID SANDOVAL</text>
			<text x="80" y="505" fill="${palette.muted}" font-family="Silkscreen, monospace" font-size="22" font-weight="700" letter-spacing="1">SOFTWARE ENGINEER</text>
			<g transform="translate(830 165) scale(0.5859375)">${logoGeometry(mode)}</g>
		</svg>
	`;
};

const createProjectMarkSvg = (mode: BrandMode): string => {
	const palette = PALETTES[mode];
	return `
		<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="0.5" y="0.5" width="399" height="399" rx="24" fill="${palette.background}" stroke="${palette.border}"/>
			<g transform="translate(50 50) scale(0.5859375)">${logoGeometry(mode)}</g>
		</svg>
	`;
};

const toResponseBody = (buffer: Buffer): Uint8Array<ArrayBuffer> => Uint8Array.from(buffer);

export const renderOpenGraphImage = async (
	mode: BrandMode
): Promise<Uint8Array<ArrayBuffer>> =>
	toResponseBody(
		await sharp(Buffer.from(createOpenGraphSvg(mode))).png({ compressionLevel: 9 }).toBuffer()
	);

export const renderProjectMark = async (
	mode: BrandMode,
	size: number
): Promise<Uint8Array<ArrayBuffer>> =>
	toResponseBody(
		await sharp(Buffer.from(createProjectMarkSvg(mode)))
			.resize(size, size, { fit: 'contain' })
			.png({ compressionLevel: 9 })
			.toBuffer()
	);
