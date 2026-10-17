import { describe, it, expect } from 'vitest';
import { interpolate } from '@shared/lib/i18n/interpolation';

describe('interpolate', () => {
	it('replaces a single string variable', () => {
		expect(interpolate('Hello {{name}}', { name: 'David' })).toBe('Hello David');
	});

	it('replaces a number variable', () => {
		expect(interpolate('You have {{count}} messages', { count: 5 })).toBe(
			'You have 5 messages'
		);
	});

	it('replaces multiple variables', () => {
		expect(interpolate('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'David' })).toBe(
			'Hi, David!'
		);
	});

	it('returns template unchanged when no variables match', () => {
		expect(interpolate('Hello {{name}}', { other: 'value' })).toBe('Hello {{name}}');
	});

	it('returns template unchanged when vars is empty', () => {
		expect(interpolate('Hello world', {})).toBe('Hello world');
	});

	it('replaces every occurrence of a repeated variable', () => {
		const result = interpolate('{{x}} and {{x}}', { x: 'A' });
		expect(result).toBe('A and A');
	});

	it('handles variable with number value 0', () => {
		expect(interpolate('Count: {{n}}', { n: 0 })).toBe('Count: 0');
	});

	it('handles empty string value', () => {
		expect(interpolate('Hello {{name}}!', { name: '' })).toBe('Hello !');
	});

	it('handles template with no placeholders', () => {
		expect(interpolate('Static text', { name: 'David' })).toBe('Static text');
	});

	it('handles nested-looking key names', () => {
		expect(interpolate('{{user.name}}', { 'user.name': 'David' })).toBe('David');
	});

	it('replaces a single string variable with single braces', () => {
		expect(interpolate('Hello {name}', { name: 'David' })).toBe('Hello David');
	});

	it('replaces multiple variables with single braces', () => {
		expect(interpolate('{greeting}, {name}!', { greeting: 'Hi', name: 'David' })).toBe(
			'Hi, David!'
		);
	});

	it('preserves single-brace placeholders when variables do not match', () => {
		expect(interpolate('Hello {name}', { other: 'value' })).toBe('Hello {name}');
	});
});
