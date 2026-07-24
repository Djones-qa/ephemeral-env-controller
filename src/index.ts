#!/usr/bin/env node
import { startServer } from './api/server';
import { logger } from './config/logger';

const command = process.argv[2];

async function main(): Promise<void> {
  switch (command) {
    case 'serve': case 'server': startServer(); break;
    default:
      console.log(`
Ephemeral Environment Controller v1.0.0

Usage:
  ephemeral-env-controller serve              Start the REST API server
  ephemeral-env-controller create [options]   Create an environment
  ephemeral-env-controller list               List active environments
  ephemeral-env-controller destroy <id>       Destroy an environment
  ephemeral-env-controller extend <id>        Extend TTL
      `);
      break;
  }
}

main().catch((err) => { logger.error(`Fatal: ${err.message}`); process.exit(1); });
