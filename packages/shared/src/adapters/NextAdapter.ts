import type { IncomingMessage, ServerResponse } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { RequestAdapter, ResponseAdapter } from './types';

type NextRequest =
  | NextApiRequest
  | (IncomingMessage & {
      cookies: NextApiRequestCookies;
    });

export class NextRequestAdapter implements RequestAdapter {
  private req: NextRequest;
  constructor(request: NextRequest) {
    this.req = request;
  }

  setRequestCookie(name: string, value: string) {
    this.req.cookies[name] = value;
  }

  getHeader(name: string) {
    return this.req.headers[name];
  }
}

export class NextResponseAdapter implements ResponseAdapter {
  private res: NextApiResponse | ServerResponse;
  constructor(response: NextApiResponse | ServerResponse) {
    this.res = response;
  }

  getHeader(name: string) {
    return this.res.getHeader(name);
  }

  setHeader(name: string, value: string) {
    this.res.setHeader(name, value);
    return this;
  }
}
