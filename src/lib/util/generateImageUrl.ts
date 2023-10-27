import { createHash } from 'crypto';

const base: string = 'https://gravatar.com/avatar';
export const generateImageUrl = (user: {
    email?: string;
    username?: string;
    id?: number;
}): string => {
    let ident = user.email || user.username || String(user.id);
    if (ident.indexOf('@')) {
        ident = ident.toLowerCase().trim();
    } else {
        ident = ident.trim();
    }
    const identHash = createHash('sha256').update(ident).digest('hex');
    return `${base}/${identHash}?s=42&d=retro&r=g`;
};
