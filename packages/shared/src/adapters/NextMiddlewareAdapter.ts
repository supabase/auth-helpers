import type { NextRequest, NextResponse } from 'next/server';
import type { RequestAdapter, ResponseAdapter } from './types';

export class NextRequestAdapter implements RequestAdapter {
  private req: NextRequest;
  constructor(request: NextRequest) {
    this.req = request;
  }

  setRequestCookie(name: string, value: string) {
    this.req.cookies[name] = value;
  }

  getHeader(name: string) {
    return this.req.headers.get(name);
  }
}

export class NextResponseAdapter implements ResponseAdapter {
  private res: NextResponse;
  constructor(response: NextResponse) {
    this.res = response;
  }

  getHeader(name: string) {
    return this.res.headers.get(name);
  }

  setHeader(name: string, value: string) {
    this.res.headers.set(name, value);
    return this;
  }
}
