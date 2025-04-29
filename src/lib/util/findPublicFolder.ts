import path from 'path';

export const findPublicFolder = (): string => {
    return path.join(
        import.meta.dirname,
        '..',
        '..',
        '..',
        'frontend',
        'build',
    );
};
