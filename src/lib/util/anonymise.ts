import { createHash } from 'crypto';

export function anonymise(s: string): string {
    const hash = createHash('sha256')
        .update(s, 'utf-8')
        .digest('hex')
        .slice(0, 9);
    return `${hash}@unleash.run`;
}
