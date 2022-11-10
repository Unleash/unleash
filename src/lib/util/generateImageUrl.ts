import gravatarUrl from 'gravatar-url';

export const generateImageUrl = (user: {
    email: string;
    username: string;
    id: number;
}): string =>
    gravatarUrl(user.email || user.username || String(user.id), {
        size: 42,
        default: 'retro',
    });
