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

export const BillingInvoiceRow = ({
    quantity,
    consumption,
    limit,
    description,
    currency,
    totalAmount,
}: DetailedInvoicesLineSchema) => {
    const percentage =
        limit && limit > 0
            ? Math.min(100, Math.round(((consumption || 0) / limit) * 100))
            : undefined;

    return (
        <>
            <StyledDescriptionCell>{description}</StyledDescriptionCell>
            <StyledCellWithIndicator>
                <ConsumptionIndicator percentage={percentage || 0} />
                <div>
                    {consumption !== undefined && limit !== undefined
                        ? `${formatLargeNumbers(consumption)}/${formatLargeNumbers(limit)}`
                        : consumption !== undefined
                          ? formatLargeNumbers(consumption)
                          : limit !== undefined
                            ? formatLargeNumbers(limit)
                            : '–'}
                </div>
            </StyledCellWithIndicator>
            <div>{quantity ? formatLargeNumbers(quantity) : '–'}</div>
            <StyledAmountCell>
                {formatCurrency(totalAmount || 0, currency)}
            </StyledAmountCell>
        </>
    );
};
