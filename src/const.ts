import { RecordKey } from './types';

export const WPT_SERVER = 'https://webpagetest.org';
export const REPORT_FILE = '../report.csv';
export const DEFAULT_DELIMITER = ';';
export const DEFAULT_MAX_DEPTH = 1; // change that at your own risk (ㆆ _ ㆆ)
export const POLL_INTERVALL_MS = 20000; // don't change it, is going to take a while anyway
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
  customMetrics:
    '[pageLinks]\n' +
    'let urls=[];\n' +
    'for(var i = document.links.length; i --> 0;)\n' +
    'if(document.links[i].hostname === location.hostname)\n' +
    'urls.push(document.links[i].href)\n' +
    'return urls',
};
