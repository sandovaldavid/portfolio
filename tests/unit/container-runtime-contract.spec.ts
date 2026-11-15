import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string): string => readFileSync(path, 'utf8');

function runResolveRuntime(
	binaries: Record<string, string>,
	envOverrides: Record<string, string | undefined> = {}
) {
	const binDir = mkdtempSync(join(tmpdir(), 'portfolio-runtime-'));
	try {
		for (const [name, script] of Object.entries(binaries)) {
			const filePath = join(binDir, name);
			writeFileSync(filePath, script, 'utf8');
			chmodSync(filePath, 0o755);
		}

		return spawnSync(
			'/bin/bash',
			[
				'-c',
				'source docker/container-runtime.sh && resolve_container_runtime && printf "%s:%s" "$CONTAINER_RUNTIME_KIND" "$CONTAINER_RUNTIME_BIN"',
			],
			{
				encoding: 'utf8',
				env: {
					...process.env,
					CONTAINER_RUNTIME: undefined,
					PATH: binDir,
					...envOverrides,
				},
			}
		);
	} finally {
		rmSync(binDir, { recursive: true, force: true });
	}
}

describe('container runtime resolution and dual Docker/Podman contracts', () => {
	it('selects docker when docker --version identifies genuine Docker', () => {
		const result = runResolveRuntime({
			docker: '#!/bin/bash\necho "Docker version 27.3.1, build ce12230"\n',
		});

		expect(result.status).toBe(0);
		expect(result.stdout).toBe('docker:docker');
	});

	it('selects podman and prefers the podman binary when docker is a podman-docker shim', () => {
		const result = runResolveRuntime({
			docker: '#!/bin/bash\necho "podman version 6.1.3"\n',
			podman: '#!/bin/bash\necho "podman version 6.1.3"\n',
		});

		expect(result.status).toBe(0);
		expect(result.stdout).toBe('podman:podman');
	});

	it('falls back to the podman-docker binary when only the shim exists', () => {
		const result = runResolveRuntime({
			docker: '#!/bin/bash\necho "Podman version 5.4.0"\n',
		});

		expect(result.status).toBe(0);
		expect(result.stdout).toBe('podman:docker');
	});

	it('selects podman when docker is absent and podman is installed', () => {
		const result = runResolveRuntime({
			podman: '#!/bin/bash\necho "podman version 6.1.3"\n',
		});

		expect(result.status).toBe(0);
		expect(result.stdout).toBe('podman:podman');
	});

	it('honors explicit CONTAINER_RUNTIME overrides and rejects unsupported values', () => {
		const binaries = {
			docker: '#!/bin/bash\necho "podman version 6.1.3"\n',
			podman: '#!/bin/bash\necho "podman version 6.1.3"\n',
		};

		const forcedDocker = runResolveRuntime(binaries, { CONTAINER_RUNTIME: 'docker' });
		expect(forcedDocker.status).toBe(0);
		expect(forcedDocker.stdout).toBe('docker:docker');

		const invalid = runResolveRuntime(binaries, { CONTAINER_RUNTIME: 'nerdctl' });
		expect(invalid.status).toBe(1);
		expect(invalid.stderr).toContain('Unsupported CONTAINER_RUNTIME');
	});

	it('fails loudly when neither docker nor podman is installed', () => {
		const result = runResolveRuntime({});

		expect(result.status).toBe(1);
		expect(result.stderr).toContain('No supported container runtime found');
	});

	it('keeps docker-compose.yml compatible with Docker CI while supporting rootless Podman in scripts', () => {
		const compose = readSource('docker-compose.yml');
		const dockerTest = readSource('docker/docker-test.sh');
		const webkitScript = readSource('scripts/update-webkit-snapshots.sh');
		const dependabotSync = readSource('.github/workflows/dependabot-sync.yml');

		expect(compose).not.toContain('keep-id');
		expect(dockerTest).toContain('container-runtime.sh');
		expect(dockerTest).toContain('--userns=keep-id');
		expect(dockerTest).toContain('compose run --rm');
		expect(webkitScript).toContain('container-runtime.sh');
		expect(webkitScript).toContain('--userns=keep-id');
		expect(dependabotSync).toContain('bun run check:devcontainer:fix');
		expect(dependabotSync).toContain(
			'git diff --quiet -- .devcontainer/ docker/Dockerfile.test docker-compose.yml scripts/update-webkit-snapshots.sh'
		);
		expect(dependabotSync).toContain(
			'git add -- .devcontainer/ docker/Dockerfile.test docker-compose.yml scripts/update-webkit-snapshots.sh'
		);
	});
});
