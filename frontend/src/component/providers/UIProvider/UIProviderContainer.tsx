import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import UIProvider from './UIProvider';

export const UIProviderContainer: React.FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const { uiConfig } = useUiConfig();

    if (!uiConfig.flags) {
        return null;
    }

    return <UIProvider>{children}</UIProvider>;
};
