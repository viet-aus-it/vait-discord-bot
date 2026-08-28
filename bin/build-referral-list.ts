import fs from 'node:fs';
import path from 'node:path';

import { type HTMLElement, parse as parseHtml } from 'node-html-parser';
import { Result } from 'oxide.ts';
import wretch from 'wretch';

import { loadEnv } from '../src/utils/load-env';
import { logger } from '../src/utils/logger';
import { recordSpanError, tracer } from '../src/utils/tracer';
import { shutdownTelemetry } from './telemetry';

const ozbargainApi = wretch('https://www.ozbargain.com.au/wiki/list_of_referral_links');
const referralModuleDir = path.join('src', 'slash-commands', 'referral');
const OUTPUT_DIR = path.join(referralModuleDir, 'generated');

const getOzbReferralNodes = async (): Promise<HTMLElement[]> => {
  logger.info('[get-ozbargain-referral-nodes]: Fetching Ozbargain referral list');
  const rawHtml = await ozbargainApi.get().text();
  const htmlTree = parseHtml(rawHtml);
  const nodes = htmlTree.querySelectorAll('.level1');
  logger.info('[get-ozbargain-referral-nodes]: Fetch Ozbargain referral list complete');
  return nodes;
};

const cleanOutputDir = () => {
  logger.info('[clean-output-dir]: Cleaning output directory');
  fs.rmSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR);
  logger.info('[clean-output-dir]: Output directory cleaned');
};

const buildOzbServicesFile = (nodes: HTMLElement[]) => {
  logger.info('[build-ozbaragain-services-file]: Building Ozbargain referral list');
  const content = JSON.stringify(nodes.map((node) => node.text.toLowerCase()));
  const filePath = path.join(OUTPUT_DIR, 'ozbargain-services.json');
  fs.writeFileSync(filePath, content);
  logger.info('[build-ozbaragain-services-file]: Ozbargain referral list complete');
};

const handleBuild = async () => {
  logger.info('[build-referral-list]: Building Ozbargain referral list');
  const nodes = await getOzbReferralNodes();
  cleanOutputDir();
  buildOzbServicesFile(nodes);
  logger.info('[build-referral-list]: Ozbargain referral list complete');
  return nodes.length;
};

const build = async () => {
  loadEnv();

  const result = await tracer.startActiveSpan('buildOzbargainReferralList', async (span) => {
    const op = await Result.safe(handleBuild());
    if (op.isOk()) {
      span.setAttribute('bot.referral.count', op.unwrap());
    } else {
      recordSpanError(op.unwrapErr(), 'err-build-referral-list-failed');
      logger.error('[build-referral-list]: Error building Ozbargain referral list', op.unwrapErr());
    }
    span.end();
    return op;
  });

  const exitCode = result.isOk() ? 0 : 1;
  await shutdownTelemetry();
  process.exit(exitCode);
};

build();
