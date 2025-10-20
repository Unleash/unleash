import type { FC } from 'react';
import { styled } from '@mui/material';
import { formatCurrency } from '../formatCurrency.ts';
import { StyledAmountCell, StyledSubgrid } from '../BillingInvoice.styles.tsx';

const StyledTableFooter = styled(StyledSubgrid)(({ theme }) => ({
    gridColumn: '3 / -1',
    padding: theme.spacing(1, 1, 0, 0),
    gap: 0,
}));

const StyledTableFooterRow = styled('div')<{ last?: boolean }>(
    ({ theme, last }) => ({
        marginRight: theme.spacing(1),
        display: 'grid',
        gridColumn: '1 / -1',
        gridTemplateColumns: 'subgrid',
        ...(last
            ? { fontWeight: theme.typography.fontWeightBold }
            : { borderBottom: `1px solid ${theme.palette.divider}` }),
        padding: theme.spacing(1.25, 0),
    }),
);

const StyledTableFooterCell = styled('div', {
    shouldForwardProp: (prop) => prop !== 'colSpan',
})<{ colSpan?: number }>(({ theme, colSpan }) => ({
    padding: theme.spacing(0, 0, 0, 0.5),
    ...(colSpan ? { gridColumn: `span ${colSpan}` } : {}),
}));

const TaxRow: FC<{
    value?: number;
    percentage?: number;
    currency?: string;
    status?: string;
}> = ({ value, percentage, currency, status }) => {
    if (value === undefined) {
        return (
            <StyledTableFooterCell colSpan={2}>
                Customer tax is exempt
            </StyledTableFooterCell>
        );
    }

    const isEstimate = status === 'estimate';
    const taxLabel =
        isEstimate && percentage !== undefined ? `Tax (${percentage}%)` : 'Tax';

    return (
        <>
            <StyledTableFooterCell>{taxLabel}</StyledTableFooterCell>
            <StyledTableFooterCell>
                <StyledAmountCell>
                    {formatCurrency(value, currency)}
                </StyledAmountCell>
            </StyledTableFooterCell>
        </>
    );
};

type BillingInvoiceFooterProps = {
    subTotal?: number;
    taxAmount?: number;
    taxPercentage?: number;
    totalAmount: number;
    currency?: string;
    status?: string;
};

export const BillingInvoiceFooter = ({
    subTotal,
    taxAmount,
    taxPercentage,
    totalAmount,
    currency,
    status,
}: BillingInvoiceFooterProps) => {
    return (
        <StyledTableFooter>
            <StyledTableFooterRow>
                <StyledTableFooterCell>Sub total</StyledTableFooterCell>
                <StyledTableFooterCell>
                    <StyledAmountCell>
                        {formatCurrency(subTotal || 0, currency)}
                    </StyledAmountCell>
                </StyledTableFooterCell>
            </StyledTableFooterRow>
            <StyledTableFooterRow>
                <TaxRow
                    value={taxAmount}
                    percentage={taxPercentage}
                    currency={currency}
                    status={status}
                />
            </StyledTableFooterRow>
            <StyledTableFooterRow last>
                <StyledTableFooterCell>Total</StyledTableFooterCell>
                <StyledTableFooterCell>
                    <StyledAmountCell>
                        {formatCurrency(totalAmount, currency)}
                    </StyledAmountCell>
                </StyledTableFooterCell>
            </StyledTableFooterRow>
        </StyledTableFooter>
    );
};
