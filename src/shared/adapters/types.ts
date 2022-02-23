type HeaderTypes = number | string | string[] | undefined | null;

export interface RequestAdapter {
  getHeader(name: string): HeaderTypes;
}

export interface ResponseAdapter {
  getHeader(name: string): HeaderTypes;
  setHeader(name: string, value: number | string | string[]): this | Response;
}
