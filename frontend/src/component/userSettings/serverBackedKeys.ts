import { toLocalStorageName } from 'utils/localStorageName';

export type ServerBackedKey = {
    key: string;
    localStorageName: string;
};

const toServerBackedKey = (key: string): ServerBackedKey => ({
    key,
    localStorageName: toLocalStorageName(key),
});

export const createServerBackedKeys = (keys: string[]): ServerBackedKey[] =>
    keys.map(toServerBackedKey);

export const serverBackedKeys = createServerBackedKeys([]);
