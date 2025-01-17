import WebPageTest from 'webpagetest';
import { RecordStatus, TRecord } from './types';

export const runTest = (wptRef: WebPageTest, url: string, options: any, depth?: number | string): Promise<TRecord> => {
  return new Promise((resolve, reject) => {
    wptRef.runTest(url, options, (_, result) => {
      const { statusCode, statusText, data } = result;
      let response: TRecord = { url, statusCode, statusText, depth: +(depth ?? 0) };
      if (statusCode !== 200 || !data?.testId) {
        response.status = RecordStatus.error.toString();
        reject(response);
        return;
      }

      response.status = RecordStatus.running.toString();
      response.testId = data.testId;
      resolve(response);
    });
  });
};

export const getIdealTestLocation = (wptRef: WebPageTest): Promise<string> => {
  return new Promise((resolve, reject) => {
    wptRef.getLocations({}, (_, result) => {
      if (!result || result.response.statusCode !== 200) {
        reject(result?.response.statusText);
        return;
      }
      resolve(
        result.response.data.location.sort((a, b) => (a.PendingTests.Total > b.PendingTests.Total ? 1 : -1))[0].id,
      );
    });
  });
};

export const getResult = (wptRef: WebPageTest, id?: string | number): Promise<Partial<TRecord>> => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject('please provide a test id...');
      return;
    }

    wptRef.getTestResults(`${id}`, { median: 0, standard: 0, average: 0 } as any, (_, result) => {
      if (result?.statusCode !== 200) {
        reject(result?.statusText);
        return;
      }

      const fv = result?.data.runs[1].firstView;
      const csvObject: Partial<TRecord> = {
        testId: result?.data.id,
        status: RecordStatus.completed,
        pageLinks: fv.pageLinks,
        Images: fv.Images?.length,
        htmlBytesUncompressed: fv.breakdown.html.bytesUncompressed,
        cssBytesUncompressed: fv.breakdown.css.bytesUncompressed,
        jsBytesUncompressed: fv.breakdown.js.bytesUncompressed,
        longTasks: fv.longTasks.length,
      };

      fv.chromeUserTiming?.forEach((chromObject: { name: string; value: number; time: number }) => {
        if (chromObject.name == 'CumulativeLayoutShift') csvObject.CumulativeLayoutShift = chromObject.value;
        if (chromObject.name == 'domComplete') csvObject.domComplete = chromObject.time;
      });

      resolve(csvObject);
    });
  });
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const trimUrl = (url: string) => {
  const _url = url.substring(0, 100);
  if (url.length > 100) {
    return `${_url}...`;
  }
  return _url;
};
