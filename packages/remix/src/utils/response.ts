import { json } from '@remix-run/server-runtime';

export const replaceResponseData = (response: Response, data: any) =>
  json(data, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
