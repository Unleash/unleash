import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters.ts';
import { formatCurrency } from '../formatCurrency.ts';
import { ConsumptionIndicator } from '../ConsumptionIndicator/ConsumptionIndicator.tsx';
import { styled, Typography } from '@mui/material';
import type { DetailedInvoicesLineSchema } from 'openapi';
import { StyledAmountCell } from '../BillingInvoice.styles.tsx';

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
    usage?: number;
};

const StyledDescriptionCell = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledSubText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

export const BillingInvoiceRow = ({
    quantity,
    consumption,
    limit,
    description,
    currency,
    totalAmount,
    startDate,
    endDate,
}: DetailedInvoicesLineSchema) => {
    const percentage =
        limit && limit > 0
            ? Math.min(100, Math.round(((consumption || 0) / limit) * 100))
            : undefined;

    const formattedStart = startDate
        ? new Date(startDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
          })
        : undefined;
    const formattedEnd = endDate
        ? new Date(endDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
          })
        : undefined;

    return (
        <>
            <StyledDescriptionCell>
                <div>{description}</div>
                {formattedStart || formattedEnd ? (
                    <StyledSubText>
                        {formattedStart} - {formattedEnd}
                    </StyledSubText>
                ) : null}
            </StyledDescriptionCell>
            <StyledCellWithIndicator>
                <ConsumptionIndicator percentage={percentage || 0} />
                {limit !== undefined ? formatLargeNumbers(limit) : '–'}
                {percentage !== undefined ? ` (${percentage}%)` : ''}
            </StyledCellWithIndicator>
            <div>{quantity ? formatLargeNumbers(quantity) : '–'}</div>
            <StyledAmountCell>
                {formatCurrency(totalAmount || 0, currency)}
            </StyledAmountCell>
        </>
    );
};
