import { describe, expect, it } from 'vitest';
import { createScopedUiTranslator, Language } from '@shared/config/i18n';

describe('home section catalog consumers', () => {
	it('resolves English hero and section copy', () => {
		const hero = createScopedUiTranslator(Language.ENGLISH, 'sections.hero');
		const research = createScopedUiTranslator(Language.ENGLISH, 'sections.research');
		const techStack = createScopedUiTranslator(Language.ENGLISH, 'sections.techStack');

		expect(hero('title')).toBe('Software Engineer building reliable web products');
		expect(hero('credential')).toContain('Remote from Peru');
		expect(research('sectionTitle')).toBe('Research');
		expect(techStack('frontendTitle')).toBe('Core frontend stack');
	});

	it('resolves Spanish hero and section copy', () => {
		const hero = createScopedUiTranslator(Language.SPANISH, 'sections.hero');
		const research = createScopedUiTranslator(Language.SPANISH, 'sections.research');
		const techStack = createScopedUiTranslator(Language.SPANISH, 'sections.techStack');

		expect(hero('title')).toBe('Ingeniero de software que construye productos web confiables');
		expect(hero('banner')).toContain('DISPONIBLE');
		expect(research('sectionTitle')).toBe('Investigación');
		expect(techStack('frontendTitle')).toBe('Stack frontend principal');
	});

	it('reuses shared status and action labels', () => {
		const commonEn = createScopedUiTranslator(Language.ENGLISH, 'common');
		const commonEs = createScopedUiTranslator(Language.SPANISH, 'common');

		expect(commonEn('status.available')).toBe('Available');
		expect(commonEs('status.inProgress')).toBe('En progreso');
		expect(commonEn('actions.viewWork')).toBe('View work');
		expect(commonEs('actions.viewWork')).toBe('Ver proyectos');
	});
});
