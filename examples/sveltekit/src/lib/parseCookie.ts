interface Objs {
  [key: string]: string | null;
};

export const parseCookie = (str: string | null) => {
  if (!str) return {};

  const decode = decodeURIComponent;

  return str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc: Objs, v) => {
      const [key, val] = v;
      acc[decode(key.trim())] = decode(val.trim());
      return acc;
    }, {});
};