import path from 'path';

export const findPublicFolder = (): string => {
    return path.join(__dirname, '..', '..', '..', 'frontend', 'build');
};
