// Avataaars avatars generated with DiceBear (avataaars style, "free for
// personal and commercial use" — no attribution required). Bundled as static
// SVGs so the intro has no runtime dependency on an avatar API.
const modules = import.meta.glob('../../../assets/intro-avatars/*.svg', {
    eager: true,
    query: '?url',
    import: 'default',
});

export const INTRO_AVATARS: string[] = Object.keys(modules)
    .sort()
    .map((key) => modules[key] as string);

/** Deterministically pick an avatar for a user index, never reshuffling. */
export const avatarForIndex = (index: number): string =>
    INTRO_AVATARS[index % INTRO_AVATARS.length];
