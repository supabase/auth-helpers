import type { RequestAdapter, ResponseAdapter } from './types';

export class SvelteKitRequestAdapter implements RequestAdapter {
  private req: Request;
  constructor(request: Request) {
    this.req = request;
  }

  setRequestCookie(name: string, value: string) {
    this.req.headers.set('cookie', `${name}=${value}`);
  }

  getHeader(name: string) {
    return this.req.headers.get(name);
  }
}

export class SvelteKitResponseAdapter implements ResponseAdapter {
  private res: Response;
  constructor(response: Response) {
    this.res = response;
  }

  getHeader(name: string) {
    return this.res.headers.get(name);
  }

  setHeader(name: string, value: string | string[]) {
    if (Array.isArray(value)) {
      value.forEach((val: string) => {
        this.res.headers.append(name, val);
      });
    } else {
      this.res.headers.set(name, value);
    }
    return this.res;
  }
}
