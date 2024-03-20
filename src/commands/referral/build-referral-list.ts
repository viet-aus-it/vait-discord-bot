import fs from 'node:fs';
import path from 'node:path';
import { type HTMLElement, parse as parseHtml } from 'node-html-parser';
import wretch from 'wretch';
import { logger } from '../../utils/logger';

const ozbargainApi = wretch('https://www.ozbargain.com.au/wiki/list_of_referral_links');

const getOzbReferralNodes = async () => {
  const rawHtml = await ozbargainApi.get().text();
  const htmlTree = parseHtml(rawHtml);
  const nodes = htmlTree.querySelectorAll('.level1');
  return nodes;
};

const buildOzbServicesFile = (nodes: HTMLElement[]) => {
  const content = nodes.reduce(
    (accum, node, index) => `${accum}\n"${node.text.toLowerCase()}"${index === nodes.length - 1 ? '];' : ','}`,
    'export const OZBARGAIN_SERVICES = ['
  );
  const filePath = path.join(__dirname, 'generated', 'ozbargain-services.ts');
  fs.writeFileSync(filePath, content);
};

const go = async () => {
  logger.info('Building Ozbargain referral list');
  const nodes = await getOzbReferralNodes();
  buildOzbServicesFile(nodes);
  logger.info('Ozbargain referral list complete');
};

go();
