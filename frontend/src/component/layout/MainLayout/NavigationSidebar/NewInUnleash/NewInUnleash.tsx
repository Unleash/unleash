import {
    type NewInUnleashItem,
    newInUnleashItems,
} from './NewInUnleashItems.tsx';
import { NewInUnleashToast } from './NewInUnleashToast.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { useDelayedUiFlagEvaluation, useUiFlag } from 'hooks/useUiFlag.ts';
import { shouldBeDisplayed } from './shouldBeDisplayed.ts';
import { useIsNewUser } from './useIsNewUser.ts';

export const useNewInUnleashItemToShow = (
    items: NewInUnleashItem[],
): NewInUnleashItem | undefined => {
    const {
        isEnterprise,
        uiConfig: { version },
    } = useUiConfig();
    const isEnabled = useDelayedUiFlagEvaluation();

    return items
        .toReversed()
        .find(shouldBeDisplayed({ isEnterprise, isEnabled, version }));
};

export const NewInUnleash = () => {
    const whatsNewPageEnabled = useUiFlag('whatsNewPage');

    const isNewUser = useIsNewUser();
    const item = useNewInUnleashItemToShow(newInUnleashItems);

    if (whatsNewPageEnabled || isNewUser || !item) {
        return null;
    }

    return <NewInUnleashToast item={item} />;
};
