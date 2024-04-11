import fs from 'node:fs';
import path from 'node:path';
import { type HTMLElement, parse as parseHtml } from 'node-html-parser';
import wretch from 'wretch';
import { logger } from '../src/utils/logger';

const ozbargainApi = wretch('https://www.ozbargain.com.au/wiki/list_of_referral_links');
const referralModuleDir = path.join(__dirname, '..', 'src', 'commands', 'referral');
const OUTPUT_DIR = path.join(referralModuleDir, 'generated');

const getOzbReferralNodes = async (): Promise<HTMLElement[]> => {
  logger.info('[get-ozbargain-referral-nodes]: Fetching Ozbargain referral list');
  const rawHtml = await ozbargainApi.get().text();
  const htmlTree = parseHtml(rawHtml);
  const nodes = htmlTree.querySelectorAll('.level1');
  logger.info('[get-ozbargain-referral-nodes]: Fetch Ozbargain referral list complete');
  return nodes;
};

const cleanOutpitDir = () => {
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

const build = async () => {
  logger.info('[build-referral-list]: Building Ozbargain referral list');
  const nodes = await getOzbReferralNodes();
  cleanOutpitDir();
  buildOzbServicesFile(nodes);
  logger.info('[build-referral-list]: Ozbargain referral list complete');
};

build();
