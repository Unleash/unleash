import semver, { SemVer } from 'semver';

export const parseStrictSemVer = (version: string): SemVer | null => {
    if (semver.clean(version) !== version) {
        return null;
    }

    try {
        return semver.parse(version, { loose: false });
    } catch {
        return null;
    }
};

export const mustParseStrictSemVer = (version: string): SemVer => {
    const parsedVersion = parseStrictSemVer(version);

    if (!parsedVersion) {
        throw new Error('Could not parse SemVer string: ${version}');
    }

    return parsedVersion;
};
