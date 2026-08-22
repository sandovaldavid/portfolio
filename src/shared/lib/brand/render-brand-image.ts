import { BRAND_EXPORT_PALETTES, type BrandExportMode } from '../../../assets/brand/export-palette';
import sharp from 'sharp';

export type BrandMode = BrandExportMode;

const logoGeometry = (mode: BrandMode): string => {
	const palette = BRAND_EXPORT_PALETTES[mode];
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

const createProjectMarkSvg = (mode: BrandMode): string => {
	const palette = BRAND_EXPORT_PALETTES[mode];
	return `
		<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="0.5" y="0.5" width="399" height="399" rx="24" fill="${palette.background}" stroke="${palette.border}"/>
			<g transform="translate(50 50) scale(0.5859375)">${logoGeometry(mode)}</g>
		</svg>
	`;
};

const toResponseBody = (buffer: Buffer): Uint8Array<ArrayBuffer> => Uint8Array.from(buffer);

export const renderProjectMark = async (mode: BrandMode, size: number) => {
	const source = Buffer.from(createProjectMarkSvg(mode));
	const image = await sharp(source)
		.resize(size, size, { fit: 'contain' })
		.png({ compressionLevel: 9 })
		.toBuffer();
	return toResponseBody(image);
};
