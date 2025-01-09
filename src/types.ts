export enum RecordKey {
  'url' = 'url',
  'status' = 'status',
  'testId' = 'testId',
  'pageLinks' = 'pageLinks',
  'CumulativeLayoutShift' = 'CumulativeLayoutShift',
  'Images' = 'Images',
  'domComplete' = 'domComplete',
  'jsBytesUncompressed' = 'jsBytesUncompressed',
  'htmlBytesUncompressed' = 'htmlBytesUncompressed',
  'cssBytesUncompressed' = 'cssBytesUncompressed',
  'longTasks' = 'longTasks',
  'depth' = 'depth',
  'statusCode' = 'statusCode',
  'statusText' = 'statusText',
}

export enum RecordStatus {
  'running' = 'running',
  'completed' = 'commpleted',
  'error' = 'error',
}

export enum JobType {
  RUN_TEST,
  CHECK_RESULT,
}

export type TRecord = Omit<{ -readonly [key in keyof typeof RecordKey]?: string | number }, RecordKey.pageLinks> & {
  [RecordKey.pageLinks]?: string[];
  [RecordKey.url]: string;
};

export type TJob = TRecord & { type: JobType };
