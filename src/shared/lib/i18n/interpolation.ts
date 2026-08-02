/**
 * Helper para traducciones con interpolación de variables.
 *
 * @param template Cadena de texto con variables en formato {{variable}}.
 * @param vars Objeto con los valores a interpolar en la plantilla.
 * @returns Cadena de texto con las variables reemplazadas por sus valores.
 *
 * @example
 * const text = interpolate('Hola {{name}}', { name: 'David' });
 */
// ponytail: single-pass regex template replace; ceiling is simple key-value maps, upgrade path is Intl.MessageFormat if pluralization/gender needed.
export function interpolate(template: string, vars: Record<string, string | number>): string {
	return template.replace(/\{\{([^}]+)\}\}/g, (match, key) =>
		key in vars ? String(vars[key]) : match
	);
}
