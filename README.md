# Ephemeral Environment Controller

[![CI Pipeline](https://github.com/Djones-qa/ephemeral-env-controller/actions/workflows/ci.yml/badge.svg)](https://github.com/Djones-qa/ephemeral-env-controller/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)
[![Jest](https://img.shields.io/badge/Jest-29-red.svg)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

On-demand ephemeral test environment provisioning — spins up isolated environments per PR/branch, manages lifecycle (create → seed → test → teardown), enforces TTL policies, tracks resource usage, and prevents cost runaway.

## Features

- **PR-Based Provisioning** — GitHub webhook triggers isolated environment creation per pull request
- **Namespace Isolation** — Each environment gets its own Docker network/namespace
- **Lifecycle Management** — State machine: pending → provisioning → seeding → ready → testing → teardown → destroyed
- **TTL Policies** — Auto-destroy after configurable hours, extend on activity
- **Resource Tracking** — Track CPU, memory, storage per environment with cost estimates
- **Seed Integration** — Auto-seed environments with test data on creation
- **Health Monitoring** — Continuous health checks with auto-recovery on failure
- **Status API** — Real-time environment status, logs, readiness probes
- **Cleanup Scheduler** — Background worker that enforces TTL and removes stale environments
- **GitHub Integration** — PR comments with environment URL, status updates on teardown

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                GitHub (PR Events / Webhooks)                      │
└──────────────────────────────┬───────────────────────────────────┘
                               │ POST /api/webhooks/github
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                Ephemeral Environment Controller                   │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐                    │
│  │  Webhook Handler│───▶│  Provisioner     │                    │
│  │  (PR open/close)│    │  (State Machine) │                    │
│  └─────────────────┘    └────────┬─────────┘                    │
│                                  │                               │
│           ┌──────────────────────┼──────────────────┐           │
│           ▼                      ▼                  ▼           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐   │
│  │  Resource       │  │  TTL Manager    │  │  Health      │   │
│  │  Allocator      │  │  (Scheduler)    │  │  Monitor     │   │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘   │
│           └─────────────────────┼──────────────────┘            │
│                                 ▼                               │
│              ┌──────────────────────────────────┐               │
│              │  PostgreSQL (Registry + History)  │               │
│              └──────────────────────────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  REST API  │  GitHub Notifier  │  Redis (TTL + Status)  │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
ephemeral-env-controller/
├── .github/workflows/
│   ├── ci.yml                          # CI pipeline
│   └── example-pr-env.yml             # Example: create env on PR
├── src/
│   ├── provisioner/
│   │   ├── state-machine.ts           # Environment lifecycle states
│   │   ├── provisioner.ts            # Core provisioning orchestrator
│   │   ├── resource-allocator.ts     # CPU/memory/port allocation
│   │   └── index.ts
│   ├── lifecycle/
│   │   ├── ttl-manager.ts            # TTL enforcement & extension
│   │   ├── cleanup-scheduler.ts      # Background cleanup worker
│   │   ├── health-monitor.ts         # Continuous health checks
│   │   └── index.ts
│   ├── api/
│   │   ├── server.ts                  # Express REST API
│   │   ├── routes/
│   │   │   ├── environments.routes.ts # CRUD environments
│   │   │   ├── webhooks.routes.ts     # GitHub webhook handler
│   │   │   └── health.routes.ts       # Service health
│   │   └── middleware/
│   │       ├── auth.middleware.ts
│   │       └── error.middleware.ts
│   ├── notifications/
│   │   └── github.notifier.ts        # PR comments & status
│   ├── storage/
│   │   ├── postgres.client.ts
│   │   ├── redis.client.ts
│   │   └── migrations/
│   │       ├── 001_create_environments.sql
│   │       └── 002_create_resource_usage.sql
│   ├── config/
│   │   ├── loader.ts
│   │   ├── logger.ts
│   │   └── defaults.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   │   ├── provisioner/
│   │   │   ├── state-machine.test.ts
│   │   │   └── resource-allocator.test.ts
│   │   └── lifecycle/
│   │       ├── ttl-manager.test.ts
│   │       └── cleanup-scheduler.test.ts
│   └── fixtures/
│       └── github-webhook.json
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── tsconfig.eslint.json
├── jest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

```bash
git clone https://github.com/Djones-qa/ephemeral-env-controller.git
cd ephemeral-env-controller
npm install
cp .env.example .env
docker compose up -d postgres redis
npm run migrate
npm run dev
```

### Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:coverage # With coverage
npm run lint          # ESLint
npm run format        # Prettier
```

## Environment Lifecycle

```
┌─────────┐    ┌──────────────┐    ┌─────────┐    ┌───────┐    ┌─────────┐    ┌──────────┐    ┌───────────┐
│ PENDING │───▶│ PROVISIONING │───▶│ SEEDING │───▶│ READY │───▶│ TESTING │───▶│ TEARDOWN │───▶│ DESTROYED │
└─────────┘    └──────────────┘    └─────────┘    └───────┘    └─────────┘    └──────────┘    └───────────┘
                      │                                  │                           │
                      ▼                                  ▼                           ▼
                 ┌──────────┐                     ┌───────────┐                ┌──────────┐
                 │  FAILED  │                     │  EXPIRED  │                │  FAILED  │
                 └──────────┘                     └───────────┘                └──────────┘
```

| State | Description |
|-------|-------------|
| `pending` | Request received, queued for provisioning |
| `provisioning` | Resources being allocated (containers, network, DB) |
| `seeding` | Test data being loaded into the environment |
| `ready` | Environment is live and accepting traffic |
| `testing` | Active test execution in progress |
| `teardown` | Cleanup in progress, resources being freed |
| `destroyed` | Fully cleaned up, records retained for history |
| `failed` | Provisioning or teardown error |
| `expired` | TTL exceeded, scheduled for teardown |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/environments` | Create a new environment |
| GET | `/api/environments` | List all environments |
| GET | `/api/environments/:id` | Get environment details |
| PATCH | `/api/environments/:id/extend` | Extend TTL |
| DELETE | `/api/environments/:id` | Trigger teardown |
| GET | `/api/environments/:id/logs` | Get environment logs |
| POST | `/api/webhooks/github` | GitHub PR webhook handler |
| GET | `/api/health` | Service health check |

## TTL Policies

Environments auto-destroy to prevent cost runaway:

| Policy | Default | Description |
|--------|---------|-------------|
| `default_ttl` | 4 hours | Standard environment lifetime |
| `max_ttl` | 24 hours | Maximum allowed lifetime |
| `extend_increment` | 2 hours | Added per extension request |
| `max_extensions` | 3 | Maximum number of extensions |
| `idle_timeout` | 1 hour | Destroy if no activity |

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3003` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://localhost:5432/ephemeral_envs` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `API_KEY` | API auth key | — |
| `DEFAULT_TTL_HOURS` | Environment lifetime | `4` |
| `MAX_TTL_HOURS` | Maximum lifetime | `24` |
| `MAX_ENVIRONMENTS` | Concurrent env limit | `10` |
| `CLEANUP_INTERVAL_MS` | Cleanup check frequency | `60000` |
| `GITHUB_TOKEN` | For PR comments | — |
| `GITHUB_WEBHOOK_SECRET` | Webhook signature verification | — |

## GitHub Action Usage

```yaml
- name: Create Test Environment
  uses: Djones-qa/ephemeral-env-controller@v1
  with:
    action: create
    api-url: https://your-controller.example.com
    pr-number: ${{ github.event.pull_request.number }}
    branch: ${{ github.head_ref }}
    ttl-hours: 4

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    BASE_URL: ${{ steps.env.outputs.url }}

- name: Teardown Environment
  if: always()
  uses: Djones-qa/ephemeral-env-controller@v1
  with:
    action: teardown
    environment-id: ${{ steps.env.outputs.id }}
```

## CI/CD Pipeline

1. **Lint & Type Check** — ESLint + TypeScript compiler
2. **Unit Tests** — Jest with coverage
3. **Docker Build** — Multi-stage production image

## Author

**Darrius Jones**

- GitHub: [@Djones-qa](https://github.com/Djones-qa)
- LinkedIn: [darrius-jones-28226b350](https://www.linkedin.com/in/darrius-jones-28226b350)

## License

MIT © 2026 Darrius Jones

See [LICENSE](./LICENSE) for details.
