import { type IInstanceStatus, InstancePlan } from 'interfaces/instance';
import { BillingDetailsPro } from './BillingDetailsPro';
import { BillingDetailsPAYG } from './BillingDetailsPAYG';
import { BillingDetailsEnterpriseConsumption } from './BillingDetailsEnterpriseConsumption';

interface IBillingDetailsProps {
    instanceStatus: IInstanceStatus;
    isPAYG: boolean;
    isEnterpriseConsumption: boolean;
}

export const BillingDetails = ({
    instanceStatus,
    isPAYG,
    isEnterpriseConsumption,
}: IBillingDetailsProps) => {
    if (isPAYG) {
        return <BillingDetailsPAYG instanceStatus={instanceStatus} />;
    }

    if (instanceStatus.plan === InstancePlan.PRO) {
        return <BillingDetailsPro instanceStatus={instanceStatus} />;
    }

    if (isEnterpriseConsumption) {
        return <BillingDetailsEnterpriseConsumption />;
    }

    return null;
};
