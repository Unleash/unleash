import { useState, type FC } from 'react';

type OrderEnvironmentsProps = {};

export const OrderEnvironments: FC<OrderEnvironmentsProps> = () => {
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        environmentsCount?: number;
    }>({ isOpen: false });

    return null;
};
