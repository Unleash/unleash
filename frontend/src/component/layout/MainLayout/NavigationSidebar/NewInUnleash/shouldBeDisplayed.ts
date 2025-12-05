import semverLt from 'semver/functions/lt';
import type { NewInUnleashItem } from './NewInUnleashItems.tsx';
import type { Flag } from 'hooks/useUiFlag.ts';
import type { Variant } from 'utils/variants.ts';

type ShouldBeDisplayedProps = {
    isEnterprise: () => boolean;
    isEnabled: (flag: Flag) => boolean | Variant;
    version: string;
};

export const shouldBeDisplayed =
    ({ isEnterprise, isEnabled, version }: ShouldBeDisplayedProps) =>
    ({
        filter: { enterpriseOnly, flag, versionLowerThan },
    }: NewInUnleashItem) => {
        if (enterpriseOnly && !isEnterprise()) {
            return false;
        }

        if (flag && !isEnabled(flag)) {
            return false;
        }

        return semverLt(version, versionLowerThan);
    };
