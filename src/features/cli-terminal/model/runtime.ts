interface GitHubStats {
	login: string;
	name: string;
	followers: number;
	following: number;
	public_repos: number;
	totalStars: number;
	totalForks: number;
	topLangs: string[];
	bio: string | null;
}

interface CliWindow extends Window {
	__portfolioCliAbort?: AbortController;
	__openShortcutsModal?: () => void;
	__openCLI?: (prefill?: string) => void;
	__portfolioGitHub?: { fetch: () => Promise<GitHubStats | null> };
}

type LineType = 'output' | 'command' | 'error' | 'info' | 'muted' | 'warning';
type RuntimeCopy = Record<string, string>;

const COMMANDS = [
	'help',
	'whoami',
	'about',
	'research',
	'ls',
	'goto ',
	'github',
	'contact',
	'skills',
	'matrix',
	'open resume',
	'clear',
	'vim',
	'nvim',
	'sudo',
	'exit',
	':q',
] as const;

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function formatCopy(template: string, variables: Record<string, string> = {}): string {
	let value = template;
	for (const [name, replacement] of Object.entries(variables)) {
		value = value.replaceAll(`{${name}}`, replacement);
	}
	return value;
}

function isEditableTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.matches(EDITABLE_SELECTOR);
}

export function setupCliTerminal(): void {
	const root = document.getElementById('cli-terminal-root');
	const dataElement = document.getElementById('cli-runtime-data');
	if (!(root instanceof HTMLElement) || !(dataElement instanceof HTMLElement)) return;

	const cliWindow = window as CliWindow;
	cliWindow.__portfolioCliAbort?.abort();
	const controller = new AbortController();
	cliWindow.__portfolioCliAbort = controller;
	const listenerOptions: AddEventListenerOptions = { signal: controller.signal };

	const copy = JSON.parse(dataElement.dataset.copy ?? '{}') as RuntimeCopy;
	const sectionNames = JSON.parse(dataElement.dataset.sectionNames ?? '[]') as string[];
	const resumeUrl = dataElement.dataset.resumeUrl ?? '';
	const githubUser = dataElement.dataset.githubUser ?? '';
	const contactEmail = dataElement.dataset.email ?? '';
	const contactLinkedin = dataElement.dataset.linkedin ?? '';
	const siteUrl = dataElement.dataset.siteUrl ?? '';

	const getCopy = (key: string): string => {
		const value = copy[key];
		if (!value) throw new Error(`Missing CLI translation: ${key}`);
		return value;
	};
	const localized = (key: string, variables: Record<string, string> = {}): string =>
		escapeHtml(formatCopy(getCopy(key), variables));

	const cliOverlayElement = document.getElementById('cli-overlay');
	const cliOutputElement = document.getElementById('cli-output');
	const cliInputElement = document.getElementById('cli-input');
	const cliCloseElement = document.getElementById('cli-close-dot');
	const shortcutsModalElement = document.getElementById('shortcuts-modal');
	const shortcutsCloseElement = document.getElementById('shortcuts-close');
	const easterEggOverlayElement = document.getElementById('easter-egg-overlay');
	const eggLoadingElement = document.getElementById('egg-loading');
	const eggStatsElement = document.getElementById('egg-stats');
	const eggCloseElement = document.getElementById('egg-close');

	if (
		!(cliOverlayElement instanceof HTMLElement) ||
		!(cliOutputElement instanceof HTMLElement) ||
		!(cliInputElement instanceof HTMLInputElement) ||
		!(cliCloseElement instanceof HTMLElement) ||
		!(shortcutsModalElement instanceof HTMLElement) ||
		!(shortcutsCloseElement instanceof HTMLElement) ||
		!(easterEggOverlayElement instanceof HTMLElement) ||
		!(eggLoadingElement instanceof HTMLElement) ||
		!(eggStatsElement instanceof HTMLElement) ||
		!(eggCloseElement instanceof HTMLElement)
	) {
		return;
	}

	const cliOverlay = cliOverlayElement;
	const cliOutput = cliOutputElement;
	const cliInput = cliInputElement;
	const cliClose = cliCloseElement;
	const shortcutsModal = shortcutsModalElement;
	const shortcutsClose = shortcutsCloseElement;
	const easterEggOverlay = easterEggOverlayElement;
	const eggLoading = eggLoadingElement;
	const eggStats = eggStatsElement;
	const eggClose = eggCloseElement;

	const history: string[] = [];
	let historyIndex = -1;
	let cliBooted = false;
	let githubCache: GitHubStats | null = null;
	let keyBuffer = '';
	let keyTimer: number | null = null;

	const colorClasses: Record<LineType, string> = {
		output: 'text-channel-portfolio-terminal-phosphor',
		command: 'text-channel-portfolio-terminal-content',
		error: 'text-channel-portfolio-terminal-error',
		info: 'text-channel-portfolio-terminal-cyan',
		muted: 'text-channel-portfolio-terminal-content-muted',
		warning: 'text-channel-portfolio-terminal-warning',
	};

	function printLine(html: string, type: LineType = 'output'): void {
		const line = document.createElement('div');
		line.className = `${colorClasses[type]} text-sm leading-relaxed`;
		line.innerHTML = html;
		cliOutput.appendChild(line);
		cliOutput.scrollTop = cliOutput.scrollHeight;
	}

	function printBlank(): void {
		const spacer = document.createElement('div');
		spacer.className = 'h-1.5';
		cliOutput.appendChild(spacer);
	}

	function printBoxTitle(key: string): void {
		printLine(`┌─ ${localized(key)} ─────────────────────────────┐`, 'info');
	}

	function printBoxEnd(): void {
		printLine('└─────────────────────────────────────────────────┘', 'info');
	}

	function printCommand(command: string, descriptionKey: string): void {
		printLine(
			`│  <span class="text-channel-portfolio-terminal-warning">${escapeHtml(command)}</span> — ${localized(descriptionKey)}`,
			'output'
		);
	}

	function openCli(prefill = ''): void {
		cliOverlay.classList.remove('hidden');
		cliOverlay.classList.add('flex');
		if (!cliBooted) bootCli();
		cliInput.value = prefill;
		requestAnimationFrame(() => cliInput.focus());
	}

	function closeCli(): void {
		cliOverlay.classList.add('hidden');
		cliOverlay.classList.remove('flex');
	}

	function openShortcuts(): void {
		shortcutsModal.classList.remove('hidden');
		shortcutsModal.classList.add('flex');
		requestAnimationFrame(() => shortcutsClose.focus());
	}

	function closeShortcuts(): void {
		shortcutsModal.classList.add('hidden');
		shortcutsModal.classList.remove('flex');
	}

	function bootCli(): void {
		cliBooted = true;
		const lines: Array<[string, LineType]> = [
			['╔══════════════════════════════════════════╗', 'info'],
			['║  PORTFOLIO OS v2.0 — sandovaldavid.com  ║', 'info'],
			[`║  ${localized('runtime.bootRole')}  ║`, 'info'],
			['╚══════════════════════════════════════════╝', 'info'],
		];
		lines.forEach(([text, type], index) => {
			window.setTimeout(() => printLine(text, type), index * 40);
		});
		window.setTimeout(
			() => {
				printBlank();
				const command =
					'<span class="text-channel-portfolio-terminal-warning font-bold">help</span>';
				const message = localized('runtime.ready', { command: '__COMMAND__' }).replace(
					'__COMMAND__',
					command
				);
				printLine(message, 'muted');
				printBlank();
			},
			lines.length * 40 + 30
		);
	}

	const sections = [
		{ number: 1, id: null as string | null, key: 'hero', name: sectionNames[0] ?? 'Hero' },
		{ number: 2, id: 'experience', key: 'experience', name: sectionNames[1] ?? 'Experience' },
		{ number: 3, id: 'research', key: 'research', name: sectionNames[2] ?? 'Research' },
		{ number: 4, id: 'projects', key: 'projects', name: sectionNames[3] ?? 'Projects' },
		{ number: 5, id: 'about-me', key: 'about', name: sectionNames[4] ?? 'About' },
		{ number: 6, id: 'technologies', key: 'tech', name: sectionNames[5] ?? 'Technologies' },
	];

	function showNavigationPopup(text: string): void {
		const popup = document.createElement('div');
		popup.className =
			'fixed top-[10%] left-1/2 -translate-x-1/2 bg-component-button-primary-bg text-component-button-primary-text px-5 py-2 border-2 border-component-button-border font-mono font-bold text-xs uppercase tracking-widest z-[150] opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap';
		popup.textContent = text;
		document.body.appendChild(popup);
		requestAnimationFrame(() => {
			popup.style.opacity = '1';
		});
		window.setTimeout(() => {
			popup.style.opacity = '0';
			window.setTimeout(() => popup.remove(), 250);
		}, 1100);
	}

	function navigateToSection(number: number): void {
		const section = sections.find(item => item.number === number);
		if (!section) return;
		if (section.id) document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
		else window.scrollTo({ top: 0, behavior: 'smooth' });
		showNavigationPopup(section.name);
	}

	function navigateToNamedSection(value: string): void {
		const normalized = value.trim().toLowerCase();
		const aliases: Record<string, string> = {
			home: 'hero',
			landing: 'hero',
			technologies: 'tech',
			technology: 'tech',
			skills: 'tech',
		};
		const target = aliases[normalized] ?? normalized;
		const section = sections.find(item => item.key === target);
		if (!section) {
			printLine(localized('runtime.gotoUnknown', { section: normalized }), 'error');
			printLine(localized('runtime.gotoAvailable'), 'muted');
			return;
		}
		printLine(localized('runtime.gotoNavigating', { section: section.name }), 'info');
		window.setTimeout(() => {
			closeCli();
			navigateToSection(section.number);
		}, 250);
	}

	async function fetchGitHubStats(): Promise<GitHubStats | null> {
		if (githubCache) return githubCache;
		try {
			const cached = sessionStorage.getItem('pf_gh_stats');
			if (cached) {
				githubCache = JSON.parse(cached) as GitHubStats;
				return githubCache;
			}
		} catch {
			// Storage may be unavailable in privacy-restricted contexts.
		}

		try {
			const [userResponse, repositoriesResponse] = await Promise.all([
				fetch(`https://api.github.com/users/${githubUser}`),
				fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`),
			]);
			if (!userResponse.ok) throw new Error('GitHub API unavailable');
			const user = (await userResponse.json()) as {
				login: string;
				name: string | null;
				followers: number;
				following: number;
				public_repos: number;
				bio: string | null;
			};
			const repositories = repositoriesResponse.ok
				? ((await repositoriesResponse.json()) as Array<{
						stargazers_count?: number;
						forks_count?: number;
						language?: string;
					}>)
				: [];
			const languageCounts: Record<string, number> = {};
			for (const repository of repositories) {
				if (repository.language) {
					languageCounts[repository.language] =
						(languageCounts[repository.language] ?? 0) + 1;
				}
			}
			githubCache = {
				login: user.login,
				name: user.name ?? 'David Sandoval',
				followers: user.followers,
				following: user.following,
				public_repos: user.public_repos,
				totalStars: repositories.reduce(
					(total, repository) => total + (repository.stargazers_count ?? 0),
					0
				),
				totalForks: repositories.reduce(
					(total, repository) => total + (repository.forks_count ?? 0),
					0
				),
				topLangs: Object.entries(languageCounts)
					.sort((left, right) => right[1] - left[1])
					.slice(0, 3)
					.map(([language]) => language),
				bio: user.bio,
			};
			try {
				sessionStorage.setItem('pf_gh_stats', JSON.stringify(githubCache));
			} catch {
				// Cache is optional.
			}
			return githubCache;
		} catch {
			return null;
		}
	}

	cliWindow.__portfolioGitHub = { fetch: fetchGitHubStats };

	function printHelp(): void {
		printBlank();
		printBoxTitle('runtime.helpTitle');
		printCommand('about', 'runtime.helpAbout');
		printCommand('research', 'runtime.helpResearch');
		printCommand('whoami', 'runtime.helpWhoami');
		printCommand('ls', 'runtime.helpList');
		printCommand('goto <section>', 'runtime.helpGoto');
		printCommand('github', 'runtime.helpGithub');
		printCommand('contact', 'runtime.helpContact');
		printCommand('skills', 'runtime.helpSkills');
		printCommand('matrix', 'runtime.helpMatrix');
		printCommand('open resume', 'runtime.helpResume');
		printCommand('clear', 'runtime.helpClear');
		printCommand(':q / exit', 'runtime.helpExit');
		printBoxEnd();
	}

	function printProfile(): void {
		printBlank();
		printBoxTitle('runtime.profileTitle');
		printLine(`│  ${localized('runtime.profileName')}: David Sandoval`, 'output');
		printLine(
			`│  ${localized('runtime.profileRole')}: ${localized('runtime.profileRoleValue')}`,
			'output'
		);
		printLine(
			`│  ${localized('runtime.profileLocation')}: ${localized('runtime.profileLocationValue')}`,
			'output'
		);
		printLine(`│  ${localized('runtime.profileCompany')}: Atena`, 'output');
		printLine(
			`│  ${localized('runtime.profileStatus')}: ${localized('runtime.profileStatusValue')}`,
			'output'
		);
		printBoxEnd();
	}

	function printList(): void {
		printBlank();
		for (const [number, key] of [
			[1, 'runtime.listHero'],
			[2, 'runtime.listExperience'],
			[3, 'runtime.listResearch'],
			[4, 'runtime.listProjects'],
			[5, 'runtime.listAbout'],
			[6, 'runtime.listTechnologies'],
		] as const) {
			printLine(`${number}. ${localized(key)}`, number === 1 ? 'info' : 'output');
		}
		printLine(localized('runtime.listTip', { name: 'projects' }), 'muted');
	}

	function printAbout(): void {
		printBlank();
		printBoxTitle('runtime.aboutTitle');
		for (const key of [
			'runtime.aboutRole',
			'runtime.aboutCurrent',
			'runtime.aboutThesis',
			'runtime.aboutUsing',
			'runtime.aboutAvailable',
		] as const) {
			printLine(`│  ${localized(key)}`, 'output');
		}
		printBoxEnd();
	}

	function printResearch(): void {
		printBlank();
		printBoxTitle('runtime.researchTitle');
		for (const key of [
			'runtime.researchThesis',
			'runtime.researchModel',
			'runtime.researchData',
			'runtime.researchEvaluation',
			'runtime.researchStatus',
			'runtime.researchDetails',
		] as const) {
			printLine(`│  ${localized(key)}`, 'output');
		}
		printBoxEnd();
	}

	function printSkills(): void {
		printBlank();
		printBoxTitle('runtime.skillsTitle');
		printLine(
			`│  ${localized('runtime.skillsFrontend')}: Angular, Astro, TypeScript`,
			'output'
		);
		printLine(`│  ${localized('runtime.skillsBackend')}: .NET, C#, Node.js`, 'output');
		printLine(`│  ${localized('runtime.skillsMl')}: TensorFlow, BiLSTM`, 'output');
		printLine(
			`│  ${localized('runtime.skillsDevops')}: GitHub Actions, Docker, Vercel`,
			'output'
		);
		printLine(`│  ${localized('runtime.skillsDatabase')}: PostgreSQL, SQL Server`, 'output');
		printBoxEnd();
	}

	function printContact(): void {
		printBlank();
		printBoxTitle('runtime.contactTitle');
		printLine(
			`│  Email: <a class="underline text-channel-portfolio-terminal-cyan" href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>`,
			'output'
		);
		printLine(
			`│  LinkedIn: <a class="underline text-channel-portfolio-terminal-cyan" href="https://www.linkedin.com/in/${escapeHtml(contactLinkedin)}" target="_blank" rel="noreferrer">${escapeHtml(contactLinkedin)}</a>`,
			'output'
		);
		printLine(
			`│  Web: <a class="underline text-channel-portfolio-terminal-cyan" href="${escapeHtml(siteUrl)}" target="_blank" rel="noreferrer">${escapeHtml(siteUrl)}</a>`,
			'output'
		);
		printBoxEnd();
	}

	async function printGitHub(): Promise<void> {
		printBlank();
		printLine(localized('runtime.githubFetching'), 'info');
		const stats = await fetchGitHubStats();
		if (!stats) {
			printLine(localized('runtime.githubError'), 'error');
			printLine(
				`${localized('runtime.githubDirect')}: https://github.com/${escapeHtml(githubUser)}`,
				'muted'
			);
			return;
		}
		printBoxTitle('runtime.githubTitle');
		printLine(`│  ${escapeHtml(stats.name)} (@${escapeHtml(stats.login)})`, 'output');
		printLine(`│  ${localized('runtime.githubRepos')}: ${stats.public_repos}`, 'output');
		printLine(`│  ${localized('runtime.githubStars')}: ${stats.totalStars}`, 'output');
		printLine(`│  ${localized('runtime.githubForks')}: ${stats.totalForks}`, 'output');
		printLine(`│  ${localized('runtime.githubFollowers')}: ${stats.followers}`, 'output');
		printLine(
			`│  ${localized('runtime.githubLanguages')}: ${escapeHtml(stats.topLangs.join(', ') || '—')}`,
			'output'
		);
		printBoxEnd();
	}

	function toggleMatrix(): void {
		document.body.classList.toggle('matrix-mode');
		printLine(localized('runtime.matrixToggled'), 'info');
	}

	function openResume(): void {
		if (!resumeUrl) return;
		printLine(localized('runtime.resumeOpening'), 'info');
		window.open(resumeUrl, '_blank', 'noopener,noreferrer');
	}

	function revealEasterEgg(): void {
		if (!easterEggOverlay.classList.contains('hidden')) return;
		closeCli();
		closeShortcuts();
		easterEggOverlay.classList.remove('hidden');
		easterEggOverlay.classList.add('flex');
		eggLoading.replaceChildren();
		eggStats.classList.add('hidden');
		const loadingKeys = [
			'easter.load1',
			'easter.load2',
			'easter.load3',
			'easter.load4',
			'easter.load5',
			'easter.load6',
			'easter.load7',
			'easter.load8',
			'easter.load9',
		];
		loadingKeys.forEach((key, index) => {
			window.setTimeout(() => {
				const line = document.createElement('div');
				line.className = 'text-channel-portfolio-terminal-cyan';
				line.textContent = `> ${getCopy(key)}`;
				eggLoading.appendChild(line);
				if (index === loadingKeys.length - 1) {
					eggStats.classList.remove('hidden');
					requestAnimationFrame(() => eggClose.focus());
				}
			}, index * 100);
		});
	}

	function closeEasterEgg(): void {
		easterEggOverlay.classList.add('hidden');
		easterEggOverlay.classList.remove('flex');
	}

	async function executeCommand(rawCommand: string): Promise<void> {
		const command = rawCommand.trim();
		if (!command) return;
		printLine(`$ ${escapeHtml(command)}`, 'command');
		history.push(command);
		historyIndex = history.length;

		const normalized = command.toLowerCase();
		if (normalized === 'clear') {
			cliOutput.replaceChildren();
			return;
		}
		if (normalized === 'help') printHelp();
		else if (normalized === 'whoami') printProfile();
		else if (normalized === 'about') printAbout();
		else if (normalized === 'research') printResearch();
		else if (normalized === 'ls') printList();
		else if (normalized.startsWith('goto ')) navigateToNamedSection(command.slice(5));
		else if (normalized === 'goto') {
			printLine(localized('runtime.gotoUsage'), 'warning');
		} else if (normalized === 'github') await printGitHub();
		else if (normalized === 'contact') printContact();
		else if (normalized === 'skills') printSkills();
		else if (normalized === 'matrix') toggleMatrix();
		else if (normalized === 'open resume') openResume();
		else if (normalized.startsWith('open ')) {
			printLine(localized('runtime.unknownTarget', { target: command.slice(5) }), 'error');
			printLine(localized('runtime.tryResume'), 'muted');
		} else if (normalized === 'vim' || normalized === 'nvim') {
			printLine(localized('runtime.vimTaste'), 'info');
			printLine(localized('runtime.vimMotions'), 'muted');
		} else if (normalized.startsWith('sudo')) {
			printLine(localized('runtime.sudoDenied'), 'error');
			printLine(localized('runtime.sudoHint'), 'muted');
		} else if (normalized === 'exit' || normalized === ':q') {
			printLine(localized('runtime.goodbye'), 'muted');
			window.setTimeout(closeCli, 150);
		} else {
			printLine(localized('runtime.commandNotFound', { command }), 'error');
			printLine(localized('runtime.typeHelp'), 'muted');
		}
	}

	function autocomplete(): void {
		const value = cliInput.value.toLowerCase();
		if (!value) return;
		const matches = COMMANDS.filter(command => command.startsWith(value));
		if (matches.length === 1) {
			cliInput.value = matches[0];
			cliInput.setSelectionRange(cliInput.value.length, cliInput.value.length);
		} else if (matches.length > 1) {
			printLine(matches.join('   '), 'muted');
		}
	}

	function closeTopmostOverlay(): boolean {
		if (!easterEggOverlay.classList.contains('hidden')) {
			closeEasterEgg();
			return true;
		}
		if (!shortcutsModal.classList.contains('hidden')) {
			closeShortcuts();
			return true;
		}
		if (!cliOverlay.classList.contains('hidden')) {
			closeCli();
			return true;
		}
		return false;
	}

	cliWindow.__openCLI = openCli;
	cliWindow.__openShortcutsModal = openShortcuts;

	cliClose.addEventListener('click', closeCli, listenerOptions);
	shortcutsClose.addEventListener('click', closeShortcuts, listenerOptions);
	eggClose.addEventListener('click', closeEasterEgg, listenerOptions);

	cliInput.addEventListener(
		'keydown',
		event => {
			if (event.key === 'Enter') {
				event.preventDefault();
				const command = cliInput.value;
				cliInput.value = '';
				void executeCommand(command);
				return;
			}
			if (event.key === 'Tab') {
				event.preventDefault();
				autocomplete();
				return;
			}
			if (event.key === 'ArrowUp') {
				event.preventDefault();
				historyIndex = Math.max(0, historyIndex - 1);
				cliInput.value = history[historyIndex] ?? '';
				return;
			}
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				historyIndex = Math.min(history.length, historyIndex + 1);
				cliInput.value = history[historyIndex] ?? '';
			}
		},
		listenerOptions
	);

	document.addEventListener(
		'keydown',
		event => {
			if (event.key === 'Escape') {
				if (closeTopmostOverlay()) event.preventDefault();
				return;
			}
			if (event.ctrlKey || event.metaKey || event.altKey || isEditableTarget(event.target))
				return;
			if (event.key === ':') {
				event.preventDefault();
				openCli();
				return;
			}
			if (event.key === '/') {
				event.preventDefault();
				openCli('goto ');
				return;
			}
			if (event.key === '?') {
				event.preventDefault();
				openShortcuts();
				return;
			}
			if (/^[1-6]$/.test(event.key)) {
				navigateToSection(Number(event.key));
				return;
			}
			if (event.key === 'j') window.scrollBy({ top: 160, behavior: 'smooth' });
			if (event.key === 'k') window.scrollBy({ top: -160, behavior: 'smooth' });
			if (event.key === 'G')
				window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

			keyBuffer = `${keyBuffer}${event.key}`.slice(-5);
			if (keyTimer !== null) window.clearTimeout(keyTimer);
			keyTimer = window.setTimeout(() => {
				keyBuffer = '';
			}, 900);
			if (keyBuffer.endsWith('gg')) {
				window.scrollTo({ top: 0, behavior: 'smooth' });
				keyBuffer = '';
			}
			if (keyBuffer.toLowerCase().endsWith('iddqd')) {
				revealEasterEgg();
				keyBuffer = '';
			}
		},
		listenerOptions
	);
}
