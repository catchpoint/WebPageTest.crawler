import path from 'path';
import WebPageTest from 'webpagetest';
import { createObjectCsvWriter } from 'csv-writer';
import { RecordStatus, TRecord } from './types';
import { REPORT_FILE, CSV_HEADER, DEFAULT_DELIMITER } from './const';

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
        Images: fv.Images.length,
        htmlBytesUncompressed: fv.breakdown.html.bytesUncompressed,
        cssBytesUncompressed: fv.breakdown.css.bytesUncompressed,
        jsBytesUncompressed: fv.breakdown.js.bytesUncompressed,
        longTasks: fv.longTasks.length,
      };
      resolve(csvObject);
    });
  });
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateReport = (records: Partial<TRecord>[]) => {
  const csvWriter = createObjectCsvWriter({
    path: path.resolve(process.cwd(), REPORT_FILE),
    header: CSV_HEADER,
    fieldDelimiter: DEFAULT_DELIMITER,
  });
  return csvWriter.writeRecords(records);
};

export const trimUrl = (url: string) => {
  const _url = url.substring(0, 100);
  if (url.length > 100) {
    return `${_url}...`;
  }
  return _url;
};
// maybe for later

// export const combine = (a: TCsvRecord[], b: TCsvRecord[], prop: keyof TCsvRecord) =>
//   Object.values(
//     [...a, ...b].reduce((acc, v) => {
//       const k = v[prop] as string;
//       if (k && ["number", "string"].includes(typeof k)) {
//         acc[k] = acc[k] ? { ...acc[k], ...v } : { ...v };
//       }
//       return acc;
//     }, {} as { [k: string]: TCsvRecord })
//   );

// export const readCsv = <T>(filePath: string, headers?: string[], delimiter: string = ";"): Promise<T[]> => {
//   const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

//   return new Promise((resolve, reject) => {
//     parse(fileContent, { delimiter, columns: headers }, (error, result: T[]) => {
//       if (error) {
//         reject(error);
//         return;
//       }

//       resolve(result);
//     });
//   });
// };
