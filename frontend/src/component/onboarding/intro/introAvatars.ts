import { formatAssetPath } from 'utils/formatPath';

// DiceBear "avataaars" — free for personal and commercial use, no attribution required.
const modules = import.meta.glob<UnformattedAssetPath>(
    '../../../assets/intro-avatars/*.svg',
    { eager: true, query: '?url', import: 'default' },
);

export const INTRO_AVATARS: string[] = Object.keys(modules)
    .sort()
    .map((key) => formatAssetPath(modules[key]));

export const avatarForIndex = (index: number): string =>
    INTRO_AVATARS[index % INTRO_AVATARS.length];
