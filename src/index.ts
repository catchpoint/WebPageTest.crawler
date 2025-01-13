#!/usr/bin/env node

import * as fs from 'fs';
import WebPageTest from 'webpagetest';
import { program } from 'commander';
import colors from 'yoctocolors';
import { getResult, getIdealTestLocation, runTest, sleep, updateReport, trimUrl } from './utils';
import {
  DEFAULT_DELIMITER,
  DEFAULT_LOCATION,
  DEFAULT_MAX_DEPTH,
  DEFAULT_TEST_CONFIGURATION,
  POLL_INTERVAL_MS,
  WPT_SERVER,
} from './const';
import { JobType, TJob, TRecord } from './types';

const { version } = require('../package.json');

program
  .version(version, '-v, - version')
  .requiredOption('-k, --key <key>', 'Key')
  .requiredOption('-f, --filePath <filePath>', 'File Path for URLs')
  .option('-l, --level [level]', '[Optional] Depth to reach', parseInt)
  .option('-ul, --limit [limit]', '[Optional] Max URLs to reach', parseInt)
  .parse(process.argv);

const queue: TJob[] = [];
let tests: TRecord[] = [];
const options = program.opts();

const MAX_DEPTH = options.level ?? DEFAULT_MAX_DEPTH;
const wpt = new WebPageTest(WPT_SERVER, options.key);

(async () => {
  const rootUrls = await fs.readFileSync(options.filePath, { encoding: 'utf-8' });
  if (!rootUrls || !rootUrls.length) {
    console.log(colors.red('please specify one or more root urls...'));
    return;
  }

  let location: string | null = DEFAULT_LOCATION;
  if (!location) {
    try {
      location = await getIdealTestLocation(wpt);
    } catch (error) {
      console.log(colors.red('No location found...'));
      return;
    }
  }
  rootUrls.split(DEFAULT_DELIMITER).forEach((url) => queue.push({ type: JobType.RUN_TEST, url }));

  while (queue.length > 0) {
    const job = queue.shift();
    if (!job) {
      break;
    }

    switch (job.type) {
      case JobType.RUN_TEST:
        try {
          console.log(colors.magenta(`Running: ${trimUrl(job.url)}`));
          const t = await runTest(wpt, job.url, { ...DEFAULT_TEST_CONFIGURATION, location }, job.depth);
          tests.push(t);
          queue.push({ type: JobType.CHECK_RESULT, ...t });
        } catch (error) {
          tests.push(error as TRecord);
        }
        break;
      case JobType.CHECK_RESULT:
        try {
          console.log(colors.blue(`Checking status for: ${trimUrl(job.url)}`));
          const idx = tests.findIndex((t) => t.testId === job.testId);
          const result = await getResult(wpt, job.testId);
          tests[idx] = { ...tests[idx], ...result };
          const _depth = +(job.depth ?? 0);
          if (_depth >= MAX_DEPTH) {
            console.log(
              colors.cyan(
                `Found ${result.pageLinks?.length ?? 0} links for ${job.testId} (${trimUrl(job.url)}) but reached max depth`,
              ),
            );
            break;
          }
          console.log(
            colors.yellow(
              `Found ${result.pageLinks?.length ?? 0} links for ${job.testId} (${trimUrl(job.url)}) [dept:${_depth}]`,
            ),
          );
          result.pageLinks?.forEach((link) => {
            if (tests.length >= options.limit) {
              console.log(colors.cyan(`Reached url limit, skipping: ${trimUrl(job.url)}`));
              return;
            }

            if (tests.findIndex((t) => t.url === link) != -1 || queue.findIndex((q) => q.url === link) != -1) {
              console.log(colors.cyan(`Skipping duplicated link ${trimUrl(job.url)}`));
              return;
            }
            queue.push({ type: JobType.RUN_TEST, url: link, depth: _depth + 1 });
          });
        } catch (error) {
          console.log(colors.gray(error as string));
          queue.push(job);
        }
        break;
      default:
        break;
    }
    updateReport(tests).then(() => console.log(colors.green('Report updated...')));
    await sleep(POLL_INTERVAL_MS);
  }
  updateReport(tests).then(() => console.log(colors.greenBright('Done...')));
})();
