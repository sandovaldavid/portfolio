import appIconDark from '../../../assets/brand/app-icon-dark.svg?raw';
import appIconLight from '../../../assets/brand/app-icon-light.svg?raw';
import sharp from 'sharp';

export type BrandMode = 'light' | 'dark';

const APP_ICON_SOURCES: Record<BrandMode, string> = {
	light: appIconLight,
	dark: appIconDark,
};

const toResponseBody = (buffer: Buffer): Uint8Array<ArrayBuffer> => Uint8Array.from(buffer);

export const renderAppIcon = async (mode: BrandMode, size: number) => {
	const image = await sharp(Buffer.from(APP_ICON_SOURCES[mode]))
		.resize(size, size, { fit: 'contain' })
		.png({ compressionLevel: 9 })
		.toBuffer();

	return toResponseBody(image);
};
