import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { Variant } from 'utils/variants';

type Flags = ReturnType<typeof useUiConfig>['uiConfig']['flags'];
export type Flag = keyof Flags;

export const useDelayedUiFlagEvaluation = (): (<K extends Flag>(
    flag: K,
) => boolean | Variant) => {
    const { uiConfig } = useUiConfig();

    return (flag) => uiConfig?.flags?.[flag] || false;
};

export const useUiFlag = useDelayedUiFlagEvaluation();
