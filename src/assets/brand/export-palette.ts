export const BRAND_EXPORT_PALETTES = {
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

export type BrandExportMode = keyof typeof BRAND_EXPORT_PALETTES;
