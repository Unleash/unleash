import { type IInstanceStatus, InstancePlan } from 'interfaces/instance';
import { BillingDetailsPro } from './BillingDetailsPro.tsx';
import { BillingDetailsPAYG } from './BillingDetailsPAYG.tsx';
import { BillingDetailsEnterpriseConsumption } from './BillingDetailsEnterpriseConsumption.tsx';

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
