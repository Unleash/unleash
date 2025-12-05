import {
    type NewInUnleashItem,
    newInUnleashItems,
} from './NewInUnleashItems.tsx';
import { NewInUnleashToast } from './NewInUnleashToast.tsx';
import semverLt from 'semver/functions/lt';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { useDelayedUiFlagEvaluation } from 'hooks/useUiFlag.ts';

// extract and test should be displayed?

export const useNewInUnleashItemToShow = (
    items: NewInUnleashItem[],
): NewInUnleashItem | undefined => {
    const {
        isEnterprise,
        uiConfig: { version },
    } = useUiConfig();
    const isEnabled = useDelayedUiFlagEvaluation();

    const shouldBeDisplayed = ({
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

    return items.toReversed().find(shouldBeDisplayed);
};

export const NewInUnleash = () => {
    const item = useNewInUnleashItemToShow(newInUnleashItems);

    if (!item) {
        return null;
    }

    return <NewInUnleashToast item={item} />;
};
