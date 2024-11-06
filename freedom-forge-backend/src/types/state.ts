export interface State {
    env: 'development' | 'production' | 'test';
    startTime: number;
    [key: string]: unknown;
  }