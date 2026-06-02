import semverGte from 'semver/functions/gte';
import semverCoerce from 'semver/functions/coerce';
import semverValid from 'semver/functions/valid';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const validOrCoerced = (version: string): string | undefined => {
    return (
        semverValid(version) ??
        semverCoerce(version, { includePrerelease: true })?.version
    );
};

export const isVersionGreaterThanOrEqual = (
    currentVersion: string,
    minimumVersion: string,
): boolean => {
    const minimum = validOrCoerced(minimumVersion);
    const current = validOrCoerced(currentVersion);

    if (minimum && current) {
        return semverGte(current, minimum);
    }

    return false;
};

export const useMinimumUnleashVersion = (minimumVersion: string): boolean => {
    const { uiConfig } = useUiConfig();
    return isVersionGreaterThanOrEqual(uiConfig.version, minimumVersion);
};
