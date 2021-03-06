import { Content, ErrorsMode } from '../types';
import { InvalidErrorMode, InvalidPath } from '../errors';

export type PathArray = string[];

export const preparePath = (path: string): PathArray => path.split('.');

export const parsePath = (path: string | TemplateStringsArray): string => {
  if (Array.isArray(path)) return path[0];
  if (typeof path === 'string') return path;
  if (path === undefined) return '';
  throw new InvalidPath(`invalid path: ${path}, path as json: ${JSON.stringify(path)}`);
};

export const getContentRecursive = (content: Content, pathArray: PathArray): Content | string => {
  if (!content) return content;
  const path = pathArray.shift();
  if (pathArray.length) {
    return getContentRecursive((content as Record<string, Content>)[path], pathArray);
  }
  if (path) {
    return content[path] as Content | string;
  }
  return content;
};

export const getContent = (content: Content | string, path: string): Content | string => {
  if (!content || typeof content !== 'object') return content;
  const pathArray = preparePath(path);
  return getContentRecursive(content, pathArray);
};

export const validate = (callback: () => string, errorsMode: ErrorsMode, extra = ''): string | never => {
  try {
    return callback();
  } catch (e) {
    if (errorsMode === 'ignore') return '';
    const error = new Error([e.message, extra].filter(Boolean).join('. '));
    if (errorsMode === 'console') {
      console.error(error); // eslint-disable-line no-console
      return '';
    }
    if (errorsMode === 'throw') throw error;
    if (typeof errorsMode === 'function') return errorsMode(error);
    throw new InvalidErrorMode(`errorsMode: "${errorsMode}"; as a json: ${JSON.stringify(errorsMode)}`);
  }
};
