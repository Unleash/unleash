import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters.ts';
import { formatCurrency } from './types.ts';
import { ConsumptionIndicator } from './ConsumptionIndicator/ConsumptionIndicator.tsx';
import type { BillingInvoiceSectionItem } from './BillingInvoice.tsx';
import { styled } from '@mui/material';

const StyledCellWithIndicator = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const BillingInvoiceRow = ({
    item,
}: { item: BillingInvoiceSectionItem }) => {
    const usage = item.quantity || 0;
    const percentage =
        item.quota && item.quota > 0
            ? Math.min(100, Math.round((usage / item.quota) * 100))
            : undefined;

    return (
        <>
            <div>{item.description}</div>
            <StyledCellWithIndicator>
                {percentage !== undefined && (
                    <ConsumptionIndicator percentage={percentage} />
                )}
                {item.quota !== undefined
                    ? formatLargeNumbers(item.quota)
                    : '–'}
                {percentage !== undefined ? ` (${percentage}%)` : ''}
            </StyledCellWithIndicator>
            <div>
                {item.quantity !== undefined
                    ? formatLargeNumbers(item.quantity)
                    : '–'}
            </div>
            <div>{formatCurrency(item.amount || 0)}</div>
        </>
    );
};
