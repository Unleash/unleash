import { resolve } from 'url';

const getUrl = (
  base: string,
  projectName?: string,
  namePrefix?: string,
  tags?: Array<string>,
): string => {
  const url = resolve(base, './client/features');
  const params = new URLSearchParams();
  if (projectName) {
    params.append('project', projectName);
  }
  if (namePrefix) {
    params.append('namePrefix', namePrefix);
  }
  if (tags) {
    tags.forEach((tag) => params.append('tag', tag));
  }
  if (params.toString().length > 0) {
    return `${url}?${params.toString()}`;
  }
  return url;
};

export const suffixSlash = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

export default getUrl;
