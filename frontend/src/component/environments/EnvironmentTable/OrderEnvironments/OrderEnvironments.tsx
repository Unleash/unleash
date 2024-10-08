import { useState, type FC } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { PurchasableFeature } from './PurchasableFeature/PurchasableFeature';
import { OrderEnvironmentsDialog } from './OrderEnvironmentsDialog/OrderEnvironmentsDialog';
import { OrderEnvironmentsConfirmation } from './OrderEnvironmentsConfirmation/OrderEnvironmentsConfirmation';

type OrderEnvironmentsProps = {};

export const OrderEnvironments: FC<OrderEnvironmentsProps> = () => {
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        environmentsCount?: number;
    }>({ isOpen: false });
    const { isPro } = useUiConfig();
    const isPurchaseAdditionalEnvironmentsEnabled = useUiFlag(
        'purchaseAdditionalEnvironments',
    );

    if (!isPro() || !isPurchaseAdditionalEnvironmentsEnabled) {
        return null;
    }

    const onSubmit = (environments: string[]) => {
        setPurchaseDialogOpen(false);
        // TODO: API call
        setConfirmationState({
            isOpen: true,
            environmentsCount: environments.length,
        });
    };

    return (
        <>
            <PurchasableFeature
                title='Order additional environments'
                description='With our Pro plan, you now have the flexibility to expand your workspace by adding up to three additional environments.'
                onClick={() => setPurchaseDialogOpen(true)}
            />
            <OrderEnvironmentsDialog
                open={purchaseDialogOpen}
                onClose={() => setPurchaseDialogOpen(false)}
                onSubmit={onSubmit}
            />
            <OrderEnvironmentsConfirmation
                open={confirmationState.isOpen}
                orderedEnvironments={confirmationState.environmentsCount || 0}
                onClose={() => setConfirmationState({ isOpen: false })}
            />
        </>
    );
};
