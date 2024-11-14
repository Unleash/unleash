import { type IInstanceStatus, InstancePlan } from 'interfaces/instance';
import { BillingDetailsPro } from './BillingDetailsPro';
import { BillingDetailsPAYG } from './BillingDetailsPAYG';

interface IBillingDetailsProps {
    instanceStatus: IInstanceStatus;
    isPAYG: boolean;
}

export const BillingDetails = ({
    instanceStatus,
    isPAYG,
}: IBillingDetailsProps) => {
    if (isPAYG) {
        return <BillingDetailsPAYG instanceStatus={instanceStatus} />;
    }

    if (instanceStatus.plan === InstancePlan.PRO) {
        return <BillingDetailsPro instanceStatus={instanceStatus} />;
    }

    return null;
};
