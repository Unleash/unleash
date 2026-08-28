// Remove trailing slashes so one screen is always recorded under the same `path`.
export const normalizePath = (path: string): string =>
    path.replace(/\/+$/, '') || '/';
