ARG PLAYWRIGHT_VERSION=1.62.0
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

ARG BUN_VERSION=1.3.14
ARG DEVCONTAINER_UID=1000
ARG DEVCONTAINER_GID=1000

LABEL org.opencontainers.image.source="https://github.com/sandovaldavid/portfolio-v1"
LABEL org.opencontainers.image.description="Reproducible development container for Portfolio V1"
LABEL org.opencontainers.image.licenses="MIT"

ENV DEBIAN_FRONTEND=noninteractive
ENV BUN_INSTALL=/home/pwuser/.bun
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

USER root
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		bash-completion \
		ca-certificates \
		curl \
		git \
		less \
		openssh-client \
		passwd \
		sudo \
		unzip \
	&& rm -rf /var/lib/apt/lists/* \
	&& conflicting_user="$(getent passwd "${DEVCONTAINER_UID}" | cut -d: -f1 || true)" \
	&& conflicting_group="$(getent group "${DEVCONTAINER_GID}" | cut -d: -f1 || true)" \
	&& if [ -n "$conflicting_user" ] && [ "$conflicting_user" != "pwuser" ]; then \
		test -z "$(getent passwd 60000 || true)"; \
		usermod --uid 60000 "$conflicting_user"; \
	fi \
	&& if [ -n "$conflicting_group" ] && [ "$conflicting_group" != "pwuser" ]; then \
		test -z "$(getent group 60000 || true)"; \
		groupmod --gid 60000 "$conflicting_group"; \
	fi \
	&& groupmod --gid "${DEVCONTAINER_GID}" pwuser \
	&& usermod --uid "${DEVCONTAINER_UID}" --gid "${DEVCONTAINER_GID}" pwuser \
	&& chown -R "${DEVCONTAINER_UID}:${DEVCONTAINER_GID}" /home/pwuser \
	&& test "$(id -u pwuser)" = "${DEVCONTAINER_UID}" \
	&& test "$(id -g pwuser)" = "${DEVCONTAINER_GID}" \
	&& echo "pwuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/pwuser \
	&& chmod 0440 /etc/sudoers.d/pwuser

USER pwuser
WORKDIR /home/pwuser

RUN curl -fsSL https://bun.com/install | bash -s "bun-v${BUN_VERSION}" \
	&& test "$(bun --version)" = "${BUN_VERSION}"

WORKDIR /workspaces/portfolio-v1
