import type { FC } from 'react';
import { Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

type OrderEnvironmentsConfirmationProps = {
    open: boolean;
    orderedEnvironments: number;
    onClose: () => void;
};

export const OrderEnvironmentsConfirmation: FC<
    OrderEnvironmentsConfirmationProps
> = ({ open, orderedEnvironments, onClose }) => {
    return (
        <Dialogue
            open={open}
            title='Order confirmed'
            onClick={onClose}
            primaryButtonText='Close'
        >
            <Typography>
                You have ordered <strong>{orderedEnvironments}</strong>{' '}
                additional{' '}
                {orderedEnvironments === 1 ? 'environment' : 'environments'}. It
                may take up to 24 hours before you will get access.
            </Typography>
        </Dialogue>
    );
};
