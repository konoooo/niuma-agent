FROM node:24-bookworm-slim AS web-builder
WORKDIR /src/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM rust:1.88-bookworm AS rust-builder
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY crates/ ./crates/
COPY resources/ ./resources/
COPY --from=web-builder /src/web/dist ./crates/niuma-web/assets/web-dist
RUN cargo build --release --locked -p niuma-agent --bin niuma-agent

FROM debian:bookworm-slim
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV http_proxy=${HTTP_PROXY} https_proxy=${HTTPS_PROXY}

ENV NIUMA_BROWSER_TOOLS="xvfb x11vnc fonts-noto-color-emoji fonts-unifont libfontconfig1 libfreetype6 xfonts-scalable fonts-liberation fonts-ipafont-gothic fonts-wqy-zenhei fonts-tlwg-loma-otf fonts-freefont-ttf"
ENV NIUMA_BROWSER_DEPS="libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2"

# Install the native browser and display helpers used by projected surfaces.
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      curl ca-certificates git bash chromium libstdc++6 \
      ${NIUMA_BROWSER_TOOLS} \
      ${NIUMA_BROWSER_DEPS}; \
    rm -rf /var/lib/apt/lists/*

# Reuse the already-pinned Node.js 24 runtime from the Web build stage.
# This avoids NodeSource/Debian package fallback drift and guarantees npm is present.
COPY --from=web-builder /usr/local/bin/node /usr/local/bin/node
COPY --from=web-builder /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && node --version \
    && npm --version \
    && npx --version

# Install Claude Code CLI and move to global path
RUN curl -fsSL https://claude.ai/install.sh | bash \
    && cp /root/.local/bin/claude /usr/local/bin/claude

# Install other CLI tools via npm
RUN npm install -g \
    @openai/codex \
    @factory/cli

COPY --from=rust-builder /src/target/release/niuma-agent /usr/local/bin/niuma-agent

# Workspace for project files (mount volumes here)
WORKDIR /workspace

# Clear build-time proxy
ENV http_proxy="" https_proxy=""

# Create non-root user (Claude CLI refuses --dangerously-skip-permissions as root)
RUN useradd -m -s /bin/bash niuma-agent \
    && mkdir -p /data /workspace \
    && chown -R niuma-agent:niuma-agent /data /workspace

USER niuma-agent
ENV HOME=/home/niuma-agent
ENV PATH="/home/niuma-agent/.local/bin:${PATH}"

# Set up Claude CLI for non-root user
RUN mkdir -p /home/niuma-agent/.local/bin \
    && ln -s /usr/local/bin/claude /home/niuma-agent/.local/bin/claude \
    && echo '{"hasCompletedOnboarding":true,"bypassPermissionsModeAccepted":true}' > /home/niuma-agent/.claude.json

# Configuration
ENV NIUMA_HOME=/data

# Daemon IPC - unauthenticated and loopback-only
# K8s sidecar: 127.0.0.1 (same Pod shares network namespace)
ENV NIUMA_DAEMON_TRANSPORT=tcp
ENV NIUMA_DAEMON_HOST=127.0.0.1
ENV NIUMA_DAEMON_PORT=9765

# Web server - bind all interfaces inside container; host publishing should stay loopback by default
ENV NIUMA_WEB_HOST=0.0.0.0
ENV NIUMA_WEB_PORT=8848
# The container interface is not loopback. Protected APIs still require the
# first administrator bootstrap; publish the host port on loopback until then.
ENV NIUMA_WEB_ALLOW_UNAUTHENTICATED=1

EXPOSE 8848
VOLUME ["/data", "/workspace"]

# niuma-agent (without args) starts both daemon and web server
CMD ["niuma-agent"]
