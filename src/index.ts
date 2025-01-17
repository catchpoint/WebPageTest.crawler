#!/usr/bin/env node

import * as fs from 'fs';
import WebPageTest from 'webpagetest';
import { program } from 'commander';
import colors from 'yoctocolors';
import { getResult, getIdealTestLocation, runTest, sleep, trimUrl } from './utils';
import {
  CSV_HEADER,
  DEFAULT_DELIMITER,
  DEFAULT_LOCATION,
  DEFAULT_MAX_DEPTH,
  DEFAULT_TEST_CONFIGURATION,
  INPUT_DELIMITER,
  POLL_CHECK_INTERVAL_MS,
  POLL_START_INTERVAL_MS,
  REPORT_FILE,
  WPT_SERVER,
} from './const';
import { JobType, TJob, TRecord } from './types';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

const { version } = require('../package.json');

program
  .version(version, '-v, - version')
  .requiredOption('-k, --key <key>', 'Key')
  .requiredOption('-f, --filePath <filePath>', 'File Path for URLs')
  .option('-l, --level [level]', '[Optional] Depth to reach', parseInt)
  .option('-ul, --limit [limit]', '[Optional] Max URLs to reach', parseInt)
  .parse(process.argv);

const csvWriter = createObjectCsvWriter({
  path: path.resolve(process.cwd(), REPORT_FILE),
  header: CSV_HEADER,
  fieldDelimiter: DEFAULT_DELIMITER,
});
const queue: TJob[] = [];
const testUrls = new Set<string>();
const options = program.opts();
const MAX_DEPTH = options.level ?? DEFAULT_MAX_DEPTH;
const wpt = new WebPageTest(WPT_SERVER, options.key);
let sleepMs = POLL_START_INTERVAL_MS;

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
  rootUrls.split(INPUT_DELIMITER).forEach((url) => {
    testUrls.add(url);
    queue.push({ type: JobType.RUN_TEST, url });
  });

  while (queue.length > 0) {
    const job = queue.shift();
    if (!job) {
      continue;
    }

    switch (job.type) {
      case JobType.RUN_TEST:
        try {
          console.log(colors.magenta(`Running: ${trimUrl(job.url)}`));
          const t = await runTest(wpt, job.url, { ...DEFAULT_TEST_CONFIGURATION, location }, job.depth);
          queue.push({ type: JobType.CHECK_RESULT, ...t });
        } catch (error) {
          await csvWriter.writeRecords([{ ...(error as TRecord), url: job.url, depth: job.depth }]);
          console.log(colors.green('Report updated...'));
        } finally {
          sleepMs = POLL_START_INTERVAL_MS;
        }
        break;
      case JobType.CHECK_RESULT:
        try {
          console.log(colors.blue(`Checking status for: ${trimUrl(job.url)}`));
          const result = await getResult(wpt, job.testId);

          await csvWriter.writeRecords([{ ...result, url: job.url, depth: job.depth }]);
          console.log(colors.green('Report updated...'));

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
            if (options.limit && testUrls.size >= options.limit) {
              console.log(colors.cyan(`Reached url limit, skipping: ${trimUrl(link)}`));
              return;
            }

            if (testUrls.has(link) || queue.findIndex((q) => q.url === link) != -1) {
              console.log(colors.cyan(`Skipping duplicated link ${trimUrl(link)}`));
              return;
            }

            testUrls.add(link);
            queue.push({ type: JobType.RUN_TEST, url: link, depth: _depth + 1 });
          });
        } catch (error) {
          console.log(colors.gray(error as string));
          queue.push(job);
        } finally {
          sleepMs = POLL_CHECK_INTERVAL_MS;
        }
        break;
      default:
        break;
    }

    if (queue.length) {
      await sleep(sleepMs);
    }
  }
  console.log(colors.greenBright('Done...'));
})();
