import { createHash } from 'crypto';

export const scopeHash = (environment: string, projects: string[]): string => {
    let hash = createHash('sha256').update(environment);
    const wildcard = projects.find((p) => p === '*');
    if (wildcard !== undefined) {
        hash = hash.update('[*]');
    } else {
        const sorted = projects.sort();
        sorted.forEach((project) => {
            hash = hash.update(`[${project}]`);
        });
    }
    return hash.digest('base64url');
};
