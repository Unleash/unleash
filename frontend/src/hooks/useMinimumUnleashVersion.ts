import semverGte from 'semver/functions/gte';
import semverCoerce from 'semver/functions/coerce';
import semverValid from 'semver/functions/valid';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const isVersionGreaterThanOrEqual = (
    currentVersion: string,
    minimumVersion: string,
): boolean => {
    const minimum = semverCoerce(minimumVersion);
    if (!minimum || !semverValid(currentVersion)) {
        return false;
    }
    return semverGte(currentVersion, minimum.version);
};

export const useMinimumUnleashVersion = (minimumVersion: string): boolean => {
    const { uiConfig } = useUiConfig();
    return isVersionGreaterThanOrEqual(uiConfig.version, minimumVersion);
};
