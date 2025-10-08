import { Button } from '@mui/material';
import { Card } from 'component/common/Card/Card';
import type { FC } from 'react';

type BillingInfoProps = {};

export const BillingInfo: FC<BillingInfoProps> = () => {
    return (
        <div>
            <Card>
                Billing details
                <div>Current plan Seat-based</div>
                <div>Plan price $450 / month</div>
                <Button>Edit billing details</Button>
            </Card>
        </div>
    );
};
