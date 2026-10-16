import type { ITag } from 'interfaces/tags';

export const tagFromKey = (key: string): ITag => {
    const separator = key.indexOf(':');
    return { type: key.slice(0, separator), value: key.slice(separator + 1) };
};
