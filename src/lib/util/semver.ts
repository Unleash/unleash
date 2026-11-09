import semver, { type SemVer } from 'semver';

/**
 * `SemVer.version` drops build metadata, so we can't use it (or `semver.clean`,
 * which is built on it) to check that the input was already canonical.
 */
const canonicalForm = (parsed: SemVer): string =>
    parsed.build.length > 0
        ? `${parsed.version}+${parsed.build.join('.')}`
        : parsed.version;

export const parseStrictSemVer = (version: string): SemVer | null => {
    let parsed: SemVer | null;
    try {
        parsed = semver.parse(version, { loose: false });
    } catch {
        return null;
    }

    if (!parsed || canonicalForm(parsed) !== version) {
        return null;
    }

    return parsed;
};

export const mustParseStrictSemVer = (version: string): SemVer => {
    const parsedVersion = parseStrictSemVer(version);

    if (!parsedVersion) {
        throw new Error(`Could not parse SemVer string: ${version}`);
    }

    return parsedVersion;
};
