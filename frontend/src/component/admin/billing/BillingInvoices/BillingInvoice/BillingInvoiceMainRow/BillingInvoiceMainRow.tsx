import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters.ts';
import { formatCurrency } from '../formatCurrency.ts';
import { styled, Typography } from '@mui/material';
import type { DetailedInvoicesLineSchema } from 'openapi';
import {
    StyledAmountCell,
    StyledDescriptionCell,
} from '../BillingInvoice.styles.tsx';

const StyledSubText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
}));

export const BillingInvoiceMainRow = ({
    quantity,
    description,
    currency,
    totalAmount,
    startDate,
    endDate,
}: DetailedInvoicesLineSchema) => {
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
            <StyledDescriptionCell expand>
                <div>{description}</div>
                {formattedStart || formattedEnd ? (
                    <StyledSubText>
                        {formattedStart} - {formattedEnd}
                    </StyledSubText>
                ) : null}
            </StyledDescriptionCell>
            <div>{quantity ? formatLargeNumbers(quantity) : '–'}</div>
            <StyledAmountCell>
                {formatCurrency(totalAmount || 0, currency)}
            </StyledAmountCell>
        </>
    );
};
