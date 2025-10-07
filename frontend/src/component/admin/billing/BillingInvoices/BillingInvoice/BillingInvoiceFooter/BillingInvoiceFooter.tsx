import type { FC } from 'react';
import { styled } from '@mui/material';
import { formatCurrency } from '../types.ts';
import { StyledSubgrid } from '../BillingInvoice.styles.tsx';

const StyledTableFooter = styled(StyledSubgrid)(({ theme }) => ({
    gridColumn: '3 / -1',
    padding: theme.spacing(1, 0, 0),
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
    }),
);

const StyledTableFooterCell = styled('div', {
    shouldForwardProp: (prop) => prop !== 'colSpan',
})<{ colSpan?: number }>(({ theme, colSpan }) => ({
    padding: theme.spacing(1, 0),
    ...(colSpan ? { gridColumn: `span ${colSpan}` } : {}),
}));

interface BillingInvoiceFooterProps {
    subTotal?: number;
    taxAmount?: number;
    totalAmount: number;
}

const TaxRow: FC<{ value?: number | null }> = ({ value }) => {
    if (value === undefined) {
        return null;
    }

    if (value === null) {
        return (
            <StyledTableFooterCell colSpan={2}>
                Customer tax is exempt
            </StyledTableFooterCell>
        );
    }

    return (
        <>
            <StyledTableFooterCell>Tax</StyledTableFooterCell>
            <StyledTableFooterCell>
                {formatCurrency(value)}
            </StyledTableFooterCell>
        </>
    );
};

export const BillingInvoiceFooter = ({
    subTotal,
    taxAmount,
    totalAmount,
}: BillingInvoiceFooterProps) => {
    return (
        <StyledTableFooter>
            {subTotal ? (
                <StyledTableFooterRow>
                    <StyledTableFooterCell>Sub total</StyledTableFooterCell>
                    <StyledTableFooterCell>
                        {formatCurrency(subTotal)}
                    </StyledTableFooterCell>
                </StyledTableFooterRow>
            ) : null}
            <StyledTableFooterRow>
                <TaxRow value={taxAmount} />
            </StyledTableFooterRow>
            <StyledTableFooterRow last>
                <StyledTableFooterCell>Total</StyledTableFooterCell>
                <StyledTableFooterCell>
                    {formatCurrency(totalAmount)}
                </StyledTableFooterCell>
            </StyledTableFooterRow>
        </StyledTableFooter>
    );
};
