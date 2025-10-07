import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters.ts';
import { formatCurrency } from '../types.ts';
import { ConsumptionIndicator } from '../ConsumptionIndicator/ConsumptionIndicator.tsx';
import { styled } from '@mui/material';

const StyledCellWithIndicator = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

type BillingInvoiceRowProps = {
    description: string;
    quantity?: number;
    amount?: number;
    quota?: number;
};

export const BillingInvoiceRow = ({
    quantity,
    amount,
    quota,
    description,
}: BillingInvoiceRowProps) => {
    const usage = quantity || 0;
    const percentage =
        quota && quota > 0
            ? Math.min(100, Math.round((usage / quota) * 100))
            : undefined;

    return (
        <>
            <div>{description}</div>
            <StyledCellWithIndicator>
                {percentage !== undefined && (
                    <ConsumptionIndicator percentage={percentage} />
                )}
                {quota !== undefined ? formatLargeNumbers(quota) : '–'}
                {percentage !== undefined ? ` (${percentage}%)` : ''}
            </StyledCellWithIndicator>
            <div>
                {quantity !== undefined ? formatLargeNumbers(quantity) : '–'}
            </div>
            <div>{formatCurrency(amount || 0)}</div>
        </>
    );
};
