import { RecordKey } from './types';

export const WPT_SERVER = 'https://www.webpagetest.org';
export const REPORT_FILE = 'report.csv';
export const DEFAULT_DELIMITER = ';';
export const DEFAULT_MAX_DEPTH = 1; // change that at your own risk (ㆆ _ ㆆ)
export const POLL_START_INTERVAL_MS = 5000; // don't change it, is going to take a while anyway
export const POLL_CHECK_INTERVAL_MS = 20000; // don't change it, is going to take a while anyway
export const DEFAULT_LOCATION = null;

export const CSV_HEADER: { id: keyof typeof RecordKey; title: string }[] = [
  { id: 'url', title: 'URL' },
  { id: 'testId', title: 'Test ID' },
  { id: 'pageLinks', title: 'Page Links' },
  { id: 'CumulativeLayoutShift', title: 'CumulativeLayoutShift' },
  { id: 'Images', title: 'Images' },
  { id: 'domComplete', title: 'DomComplete' },
  { id: 'jsBytesUncompressed', title: 'JS Bytes Uncompressed' },
  { id: 'htmlBytesUncompressed', title: 'Html Bytes Uncompressed' },
  { id: 'cssBytesUncompressed', title: 'CSS Bytes Uncompressed' },
  { id: 'longTasks', title: 'Long Tasks' },
  { id: 'depth', title: 'Depth' },
  { id: 'statusCode', title: 'Response Code' },
  { id: 'statusText', title: 'Response Text' },
];

export const DEFAULT_TEST_CONFIGURATION = {
  firstViewOnly: true,
  runs: 1,
  connectivity: 'Native',
  customMetrics: `
    [pageLinks]
    let urls=[];
    for(var i = document.links.length; i --> 0;)
      if(document.links[i].hostname === location.hostname)
        urls.push(document.links[i].href)
    return urls`,
};
