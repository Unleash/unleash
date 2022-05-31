import semver, { SemVer } from 'semver';

export const mustParseSemVer = (version: string): SemVer => {
    const parsedVersion = semver.parse(version);

    if (!parsedVersion) {
        throw new Error('Could not parse semver string: ${version}');
    }

    return parsedVersion;
};
