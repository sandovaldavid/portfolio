import { test, expect } from './fixtures';

/**
 * Regression coverage for issue #244: LinkInline used to hardcode its own
 * class list and drop every class/attribute a consumer passed, so the
 * `mb-8`/`gap-2`/`text-sm` classes on blog and devlog back-links were
 * silently discarded. Project case studies no longer render this inline
 * back-link composition and are covered by their own navigation contracts.
 */

const BACK_LINK_CONSUMERS = [
	{ path: '/blog/building-this-portfolio-with-astro-and-fsd', name: 'Blog detail (EN)' },
	{ path: '/es/blog/building-this-portfolio-with-astro-and-fsd', name: 'Blog detail (ES)' },
	{ path: '/devlog/v1-3-0-beta', name: 'Devlog detail (EN)' },
];

for (const { path, name } of BACK_LINK_CONSUMERS) {
	test(`${name} - back link keeps consumer classes and drops role="link"`, async ({ page }) => {
		await page.goto(path);

		const backLink = page.locator('main a.text-sm').first();
		await expect(backLink).toBeVisible();
		await expect(backLink).toHaveClass(/gap-2/);
		await expect(backLink).toHaveClass(/text-sm/);
		await expect(backLink).not.toHaveAttribute('role', 'link');
	});
}

test.describe('Blog article header (issue #244)', () => {
	test('back navigation is a labelled landmark with visible spacing before metadata', async ({
		page,
	}) => {
		await page.goto('/blog/building-this-portfolio-with-astro-and-fsd');

		const nav = page.locator('main header nav[aria-label]');
		await expect(nav).toBeVisible();

		const navBox = await nav.boundingBox();
		const metadataBox = await page.locator('main header time').first().boundingBox();
		expect(navBox).not.toBeNull();
		expect(metadataBox).not.toBeNull();
		expect(metadataBox!.y).toBeGreaterThan(navBox!.y + navBox!.height);
	});

	test('metadata and tags render as distinct sibling groups', async ({ page }) => {
		await page.goto('/blog/building-this-portfolio-with-astro-and-fsd');

		const groups = page.locator('main header > div').first().locator('> div');
		await expect(groups).toHaveCount(2);

		const metadataGroup = groups.nth(0);
		const tagsGroup = groups.nth(1);
		await expect(metadataGroup.locator('time')).toHaveCount(1);
		await expect(tagsGroup.locator('span.sr-only')).toHaveCount(1);
	});

	test('tags wrap inside the header instead of overflowing past it', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/blog/building-this-portfolio-with-astro-and-fsd');

		const header = page.locator('main header').first();
		const tagsGroup = page.locator('main header > div').first().locator('> div').nth(1);
		const headerBox = await header.boundingBox();
		const tagsBox = await tagsGroup.boundingBox();
		expect(headerBox).not.toBeNull();
		expect(tagsBox).not.toBeNull();
		expect(tagsBox!.x + tagsBox!.width).toBeLessThanOrEqual(
			headerBox!.x + headerBox!.width + 1
		);
	});
});
