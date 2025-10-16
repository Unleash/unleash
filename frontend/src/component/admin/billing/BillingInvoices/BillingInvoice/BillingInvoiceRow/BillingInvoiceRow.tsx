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
    maxHeight: theme.spacing(2.5),
}));

const StyledDescriptionCell = styled('div', {
    shouldForwardProp: (prop) => prop !== 'expand',
})<{ expand?: boolean }>(({ theme, expand }) => ({
    display: 'flex',
    flexDirection: 'column',
    gridColumn: expand ? '1 / span 2' : undefined,
}));

const StyledSubText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
}));

type BillingInvoiceRowProps = DetailedInvoicesLineSchema & {
    showLimits: boolean;
};

export const BillingInvoiceRow = ({
    quantity,
    consumption,
    limit,
    description,
    currency,
    totalAmount,
    showLimits,
    startDate,
    endDate,
}: BillingInvoiceRowProps) => {
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
            <StyledDescriptionCell expand={!showLimits}>
                <div>{description}</div>
                {!showLimits && (formattedStart || formattedEnd) ? (
                    <StyledSubText>
                        {formattedStart} - {formattedEnd}
                    </StyledSubText>
                ) : null}
            </StyledDescriptionCell>
            {showLimits ? (
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
            ) : null}
            <div>{quantity ? formatLargeNumbers(quantity) : '–'}</div>
            <StyledAmountCell>
                {formatCurrency(totalAmount || 0, currency)}
            </StyledAmountCell>
        </>
    );
};
