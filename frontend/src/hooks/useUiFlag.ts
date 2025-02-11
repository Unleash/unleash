import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

type flags = ReturnType<typeof useUiConfig>['uiConfig']['flags'];

export const useUiFlag = <K extends keyof flags>(flag: K): boolean => {
    const { uiConfig } = useUiConfig();
    if (typeof uiConfig?.flags?.[flag] !== 'boolean') {
        console.error(`Flag ${flag} is undefined or a variant.`);
    }

    return Boolean(uiConfig?.flags?.[flag]) || false;
};
