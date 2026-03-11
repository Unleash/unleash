import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters.ts';
import { formatCurrency } from '../formatCurrency.ts';
import { ConsumptionIndicator } from '../ConsumptionIndicator/ConsumptionIndicator.tsx';
import { styled } from '@mui/material';
import type { DetailedInvoicesLineSchema } from 'openapi';
import {
    StyledAmountCell,
    StyledDescriptionCell,
} from '../BillingInvoice.styles.tsx';

const hasValidUsageData = (consumption?: number, limit?: number): boolean => {
    return Boolean(consumption && limit);
};

const calculateOverage = (consumption?: number, limit?: number): number => {
    return hasValidUsageData(consumption, limit)
        ? Math.floor(Math.max(0, consumption! - limit!))
        : 0;
};

const calculateIncludedAmount = (
    consumption?: number,
    limit?: number,
): number | undefined => {
    return hasValidUsageData(consumption, limit)
        ? Math.min(consumption!, limit!)
        : consumption;
};

const StyledCellWithIndicator = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    maxHeight: theme.spacing(2.5),
}));

type BillingInvoiceUsageRowProps = DetailedInvoicesLineSchema & {
    invoiceCurrency?: string;
};

export const BillingInvoiceUsageRow = ({
    quantity,
    consumption,
    limit,
    description,
    totalAmount,
    invoiceCurrency,
}: BillingInvoiceUsageRowProps) => {
    const percentage =
        limit && limit > 0
            ? Math.min(100, Math.round(((consumption || 0) / limit) * 100))
            : undefined;

    const hasValidData = hasValidUsageData(consumption, limit);
    const overage = hasValidData ? calculateOverage(consumption, limit) : quantity;
    const includedAmount = hasValidData
        ? calculateIncludedAmount(consumption, limit)
        : consumption;
    const calculatedAmount = totalAmount;

    const hasAmount = calculatedAmount && calculatedAmount > 0;
    const showConsumption = hasValidData;

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
            {showConsumption ? (
                <StyledCellWithIndicator>
                    <ConsumptionIndicator percentage={percentage || 0} />
                    <div>{formatIncludedDisplay()}</div>
                </StyledCellWithIndicator>
            ) : (
                <div />
            )}
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
