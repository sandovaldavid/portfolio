import { expect, test } from './fixtures';

test.describe('navigation lockup focus geometry', () => {
	test('keeps the focus ring and content symmetrically aligned', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
		await page.goto('/');

		const brandLink = page.locator('header a.brand-logo-link');
		await brandLink.focus();
		await expect(brandLink).toBeFocused();

		const geometry = await brandLink.evaluate(element => {
			const mark = element.querySelector<HTMLElement>('[data-brand-logo]');
			const signature = element.querySelector<HTMLElement>('.brand-logo-signature');
			if (!mark || !signature) {
				throw new Error('Navigation lockup geometry is incomplete.');
			}

			const linkRect = element.getBoundingClientRect();
			const markRect = mark.getBoundingClientRect();
			const signatureRect = signature.getBoundingClientRect();
			const style = getComputedStyle(element);
			const linkCenter = linkRect.top + linkRect.height / 2;

			return {
				outlineStyle: style.outlineStyle,
				outlineWidth: style.outlineWidth,
				outlineOffset: style.outlineOffset,
				leftInset: markRect.left - linkRect.left,
				rightInset: linkRect.right - signatureRect.right,
				markCenterDelta: Math.abs(markRect.top + markRect.height / 2 - linkCenter),
				signatureCenterDelta: Math.abs(
					signatureRect.top + signatureRect.height / 2 - linkCenter
				),
			};
		});

		expect(geometry.outlineStyle).toBe('solid');
		expect(geometry.outlineWidth).toBe('2px');
		expect(geometry.outlineOffset).toBe('-2px');
		expect(geometry.leftInset).toBeGreaterThanOrEqual(7.5);
		expect(geometry.rightInset).toBeGreaterThanOrEqual(7.5);
		expect(Math.abs(geometry.leftInset - geometry.rightInset)).toBeLessThanOrEqual(1);
		expect(geometry.markCenterDelta).toBeLessThanOrEqual(1);
		expect(geometry.signatureCenterDelta).toBeLessThanOrEqual(1);
	});
});
