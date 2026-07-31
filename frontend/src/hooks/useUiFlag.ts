import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { applyOverrides, useUiFlagOverrides } from './useUiFlagOverrides.js';

type Flags = ReturnType<typeof useUiConfig>['uiConfig']['flags'];
export type Flag = keyof Flags;

export const useUiFlagEvaluator = (): (<K extends Flag>(
    flag: K,
) => NonNullable<Flags[K]> | false) => {
    const { uiConfig } = useUiConfig();
    const overrides = useUiFlagOverrides(uiConfig.flags);

    return <K extends Flag>(flag: K) =>
        applyOverrides(uiConfig?.flags?.[flag], flag, overrides) as
            | NonNullable<Flags[K]>
            | false;
};

export const useUiFlag = <K extends Flag>(flag: K) => {
    const evaluate = useUiFlagEvaluator();
    return evaluate(flag);
};
