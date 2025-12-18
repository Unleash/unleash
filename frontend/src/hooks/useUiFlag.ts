import type useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

type Flags = ReturnType<typeof useUiConfig>['uiConfig']['flags'];
export type Flag = keyof Flags;

export const useDelayedUiFlagEvaluation = (): (<K extends Flag>(
    flag: K,
) => NonNullable<Flags[K]> | boolean) => {

    return () => true;
};

export const useUiFlag = <K extends Flag>(flag: K) => {
    return true;
};
