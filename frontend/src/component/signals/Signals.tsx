import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { SignalEndpointsTable } from './SignalEndpointsTable/SignalEndpointsTable.tsx';

export const Signals = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='signals' />;
    }

    return <SignalEndpointsTable />;
};
