import {
    type IInstanceStatus,
    InstancePlan,
    InstancePrices,
} from 'interfaces/instance';
import { BillingDetailsPro } from './BillingDetailsPro.tsx';
import { BillingDetailsPAYG } from './BillingDetailsPAYG.tsx';
import { BillingDetailsEnterpriseConsumption } from './BillingDetailsEnterpriseConsumption.tsx';

interface IBillingDetailsProps {
    instanceStatus: IInstanceStatus;
    instancePrices: InstancePrices;
    isPAYG: boolean;
    isEnterpriseConsumption: boolean;
}

export const BillingDetails = ({
    instanceStatus,
    instancePrices,
    isPAYG,
    isEnterpriseConsumption,
}: IBillingDetailsProps) => {
    if (isPAYG) {
        return (
            <BillingDetailsPAYG
                instanceStatus={instanceStatus}
                instancePrices={instancePrices}
            />
        );
    }

    if (instanceStatus.plan === InstancePlan.PRO) {
        return <BillingDetailsPro instancePrices={instancePrices} />;
    }

    if (isEnterpriseConsumption) {
        return <BillingDetailsEnterpriseConsumption />;
    }

    return null;
};
