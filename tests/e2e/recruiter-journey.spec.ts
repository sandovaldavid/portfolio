import { test, expect } from '@playwright/test';

/**
 * End-to-end contract for the primary recruiter journey (#209): a reviewer must be
 * able to identify David's role, reach the two strongest project case studies,
 * inspect public source evidence where the card exposes it, reach the correct
 * localized resume, and reach GitHub, LinkedIn and email — in English and Spanish,
 * on desktop and mobile — without dismissing the retro splash, opening the CLI,
 * or opening the Recruiter HUD.
 */

const LOCALES = [
	{
		code: 'en',
		home: '/',
		roleText: 'Software Engineer',
		viewWorkText: 'View work',
		contactText: 'GET IN TOUCH',
		caseStudyText: 'Case Study',
		resumeHref: 'https://sandovaldavid.com/resume/david-sandoval-resume.pdf',
	},
	{
		code: 'es',
		home: '/es/',
		roleText: 'Ingeniero de software',
		viewWorkText: 'Ver proyectos',
		contactText: 'CONTACTARME',
		caseStudyText: 'Caso de estudio',
		resumeHref: 'https://sandovaldavid.com/resume/david-sandoval-resume-es.pdf',
	},
] as const;

const VIEWPORTS = [
	{ name: 'desktop', size: { width: 1280, height: 800 } },
	{ name: 'mobile', size: { width: 390, height: 844 } },
] as const;

test.describe('Recruiter journey — identity, evidence, resume and contact', () => {
	for (const locale of LOCALES) {
		for (const viewport of VIEWPORTS) {
			test(`${locale.code}/${viewport.name}: the full journey is reachable without splash, CLI or HUD interaction`, async ({
				page,
			}) => {
				await page.setViewportSize(viewport.size);
				await page.goto(locale.home);

				// Primary content is available immediately: no retro splash, no locked scroll.
				await expect(page.locator('#splash-screen')).toBeHidden();
				await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

				// 1. Identity and current role are understandable on first scan.
				await expect(page.locator('h1').first()).toContainText('David Sandoval');
				await expect(
					page.getByText(locale.roleText, { exact: true }).first()
				).toBeVisible();

				// 2. The two strongest projects expose their case studies. Public source is
				// an optional secondary action on tablet/desktop; private-source projects do
				// not expose a source CTA on the card.
				const yukidokeCard = page.locator('article', {
					has: page.getByRole('heading', { name: 'Yukidoke' }),
				});
				const kiokuCard = page.locator('article', {
					has: page.getByRole('heading', { name: 'Kioku' }),
				});
				await expect(yukidokeCard).toBeVisible();
				await expect(kiokuCard).toBeVisible();
				await expect(
					yukidokeCard.getByRole('link', { name: locale.caseStudyText, exact: true })
				).toBeVisible();
				await expect(
					kiokuCard.getByRole('link', { name: locale.caseStudyText, exact: true })
				).toBeVisible();

				const yukidokeSource = yukidokeCard.locator(
					'a[href*="github.com/sandovaldavid/yukidoke"]'
				);
				const kiokuSource = kiokuCard.locator(
					'a[href="https://github.com/sandovaldavid/kioku"]'
				);
				await expect(yukidokeSource).toHaveCount(0);
				if (viewport.name === 'desktop') {
					await expect(kiokuSource).toBeVisible();
				} else {
					await expect(kiokuSource).toBeHidden();
				}

				// 3. Resume resolves to the correct localized artifact. On mobile the resume
				// CTA lives inside the primary nav overlay, so open it first — that is
				// ordinary primary navigation, not the optional splash/CLI/HUD interactions
				// this journey must avoid.
				if (viewport.name === 'mobile') {
					await page.locator('#mobile-menu-btn').click();
				}
				await expect(
					page.getByRole('link', { name: /resume|cv/i }).first()
				).toHaveAttribute('href', locale.resumeHref);
				if (viewport.name === 'mobile') {
					await page.locator('#mobile-menu-close').click();
				}

				// 4. Professional contact channels resolve to the canonical registry. Their
				// accessible name is prefixed with the visible label and suffixed with a
				// screen-reader-only "opens in a new tab" announcement, so match loosely.
				await expect(page.getByRole('link', { name: /^GitHub\b/ }).first()).toHaveAttribute(
					'href',
					'https://github.com/sandovaldavid'
				);
				await expect(
					page.getByRole('link', { name: /^LinkedIn\b/ }).first()
				).toHaveAttribute('href', 'https://www.linkedin.com/in/jdsandovals');
				await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute(
					'href',
					'mailto:hello@sandovaldavid.com'
				);

				// 5. Primary calls to action are present without any optional retro interaction.
				await expect(
					page.getByRole('link', { name: locale.viewWorkText, exact: true })
				).toBeVisible();
				await expect(
					page.getByRole('link', { name: locale.contactText, exact: true }).first()
				).toBeVisible();
			});
		}
	}
});

test.describe('Recruiter journey — keyboard operability', () => {
	for (const locale of LOCALES) {
		test(`${locale.code}: skip link and primary nav are reachable in order by keyboard alone`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(locale.home);

			await page.keyboard.press('Tab');
			await expect(page.locator('a[href="#main-content"]')).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(page.locator('header a.brand-logo-link')).toBeFocused();

			for (const sectionId of ['experience', 'projects', 'research', 'about-me', 'blog']) {
				await page.keyboard.press('Tab');
				await expect(
					page.locator(`header a[data-section-id="${sectionId}"]:not(#mobile-menu a)`)
				).toBeFocused();
			}
		});
	}
});

test.describe('Recruiter journey — reduced motion', () => {
	for (const locale of LOCALES) {
		test(`${locale.code}: renders and scrolls correctly with prefers-reduced-motion`, async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion: 'reduce' });
			const pageErrors: string[] = [];
			page.on('pageerror', error => pageErrors.push(error.message));

			await page.goto(locale.home);
			await expect(page.locator('h1').first()).toBeVisible();

			await page.locator('#projects').scrollIntoViewIfNeeded();
			await expect(page.locator('#projects')).toBeVisible();

			expect(pageErrors).toEqual([]);
		});
	}
});
