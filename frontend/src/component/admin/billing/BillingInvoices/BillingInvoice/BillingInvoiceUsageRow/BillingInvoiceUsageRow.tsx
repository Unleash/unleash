import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters.ts';
import { formatCurrency } from '../formatCurrency.ts';
import { ConsumptionIndicator } from '../ConsumptionIndicator/ConsumptionIndicator.tsx';
import { styled } from '@mui/material';
import type { DetailedInvoicesLineSchema } from 'openapi';
import {
    StyledAmountCell,
    StyledDescriptionCell,
} from '../BillingInvoice.styles.tsx';

const StyledCellWithIndicator = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    maxHeight: theme.spacing(2.5),
}));

type BillingInvoiceUsageRowProps = DetailedInvoicesLineSchema & {
    invoiceCurrency?: string;
    invoiceStatus?: string;
};

export const BillingInvoiceUsageRow = ({
    quantity,
    consumption,
    limit,
    description,
    totalAmount,
    unitPrice,
    invoiceCurrency,
    invoiceStatus,
}: BillingInvoiceUsageRowProps) => {
    const percentage =
        limit && limit > 0
            ? Math.min(100, Math.round(((consumption || 0) / limit) * 100))
            : undefined;

    const isEstimate = invoiceStatus === 'estimate';
    const overage =
        isEstimate && consumption && limit
            ? Math.max(0, consumption - limit)
            : quantity;
    const includedAmount =
        isEstimate && consumption && limit
            ? Math.min(consumption, limit)
            : consumption;
    const calculatedAmount =
        isEstimate && unitPrice && consumption && limit
            ? Math.max(0, consumption - limit) * unitPrice
            : totalAmount;

    const hasAmount = calculatedAmount && calculatedAmount > 0;

    const formatIncludedDisplay = () => {
        if (includedAmount !== undefined && limit !== undefined) {
            return `${formatLargeNumbers(includedAmount)}/${formatLargeNumbers(limit)}`;
        }
        if (includedAmount !== undefined) {
            return formatLargeNumbers(includedAmount);
        }
        if (limit !== undefined) {
            return formatLargeNumbers(limit);
        }
        return '–';
    };

    return (
        <>
            <StyledDescriptionCell>{description}</StyledDescriptionCell>
            <StyledCellWithIndicator>
                <ConsumptionIndicator percentage={percentage || 0} />
                <div>{formatIncludedDisplay()}</div>
            </StyledCellWithIndicator>
            <div>{overage ? formatLargeNumbers(overage) : ''}</div>
            {hasAmount ? (
                <StyledAmountCell>
                    {formatCurrency(calculatedAmount, invoiceCurrency)}
                </StyledAmountCell>
            ) : (
                <div />
            )}
        </>
    );
};
