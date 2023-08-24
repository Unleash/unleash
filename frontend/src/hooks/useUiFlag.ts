import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

type flags = ReturnType<typeof useUiConfig>['uiConfig']['flags'];

export const useUiFlag = <K extends keyof flags>(flag: K) => {
    const { uiConfig } = useUiConfig();

    return uiConfig?.flags?.[flag] || false;
};
