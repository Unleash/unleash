import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

type Flags = ReturnType<typeof useUiConfig>['uiConfig']['flags'];
export type Flag = keyof Flags;

export const useDelayedUiFlagEvaluation = (): (<K extends Flag>(
    flag: K,
) => NonNullable<Flags[K]> | false) => {
    const { uiConfig } = useUiConfig();

    return (flag) => uiConfig?.flags?.[flag] || false;
};

export const useUiFlag = <K extends Flag>(flag: K) => {
    const evaluate = useDelayedUiFlagEvaluation();
    return evaluate(flag);
};
