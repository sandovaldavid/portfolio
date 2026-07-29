import type { Language } from './languages';

export type LocalizedPathMap = Partial<Record<Language, string>>;

export type StringCatalogShape<T> = T extends string
	? string
	: T extends readonly unknown[]
		? never
		: { readonly [Key in keyof T]: StringCatalogShape<T[Key]> };

export type LeafPath<T> = {
	[Key in keyof T & string]: T[Key] extends string
		? Key
		: T[Key] extends Record<string, unknown>
			? `${Key}.${LeafPath<T[Key]>}`
			: never;
}[keyof T & string];

export type KeysWithinNamespace<
	AllKeys extends string,
	Namespace extends string,
> = AllKeys extends `${Namespace}.${infer Key}` ? Key : never;
