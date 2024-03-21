import fs from 'node:fs';
import path from 'node:path';
import { type HTMLElement, parse as parseHtml } from 'node-html-parser';
import wretch from 'wretch';
import { logger } from '../utils/logger';

const ozbargainApi = wretch('https://www.ozbargain.com.au/wiki/list_of_referral_links');
const OUTPUT_DIR = path.join(__dirname, '..', 'commands', 'referral', 'generated');

const getOzbReferralNodes = async () => {
  const rawHtml = await ozbargainApi.get().text();
  const htmlTree = parseHtml(rawHtml);
  const nodes = htmlTree.querySelectorAll('.level1');
  return nodes;
};

const buildOzbServicesTs = (nodes: HTMLElement[]) => {
  const content = nodes.reduce(
    (accum, node, index) => `${accum}\n"${node.text.toLowerCase()}"${index === nodes.length - 1 ? '];' : ','}`,
    'export const OZBARGAIN_SERVICES = ['
  );
  const filePath = path.join(OUTPUT_DIR, 'ozbargain-services.ts');
  fs.writeFileSync(filePath, content);
};

const buildOzbServicesJson = (nodes: HTMLElement[]) => {
  const content = JSON.stringify(nodes.map((node) => node.text.toLowerCase()));
  const filePath = path.join(OUTPUT_DIR, 'ozbargain-services-data.json');
  fs.writeFileSync(filePath, content);
};

const go = async () => {
  logger.info('Building Ozbargain referral list');
  const nodes = await getOzbReferralNodes();
  buildOzbServicesTs(nodes);
  buildOzbServicesJson(nodes);
  logger.info('Ozbargain referral list complete');
};

go();
