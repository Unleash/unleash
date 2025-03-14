import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

type flags = ReturnType<typeof useUiConfig>['uiConfig']['flags'];

export const useUiFlag = <K extends keyof flags>(flag: K): boolean => {
    const { uiConfig } = useUiConfig();
    const value = uiConfig?.flags?.[flag];
    if (typeof value === 'boolean') {
        return value;
    } else if (typeof value !== 'undefined') {
        console.error(`Flag ${flag} does not return a boolean.`);
    }

    return false;
};
