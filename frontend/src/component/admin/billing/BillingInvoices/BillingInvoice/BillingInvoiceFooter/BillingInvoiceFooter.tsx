import type { FC } from 'react';
import { styled } from '@mui/material';
import { formatCurrency } from '../formatCurrency.ts';
import { StyledAmountCell, StyledSubgrid } from '../BillingInvoice.styles.tsx';

const StyledTableFooter = styled(StyledSubgrid)(({ theme }) => ({
    gridColumn: '3 / -1',
    padding: theme.spacing(1, 1, 0, 0),
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
    padding: theme.spacing(1, 0, 1, 0.5),
    ...(colSpan ? { gridColumn: `span ${colSpan}` } : {}),
}));

const TaxRow: FC<{ value?: number }> = ({ value }) => {
    if (value === undefined) {
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
                <StyledAmountCell>{formatCurrency(value)}</StyledAmountCell>
            </StyledTableFooterCell>
        </>
    );
};

type BillingInvoiceFooterProps = {
    subTotal?: number;
    taxAmount?: number;
    totalAmount: number;
    currency?: string;
};

export const BillingInvoiceFooter = ({
    subTotal,
    taxAmount,
    totalAmount,
    currency,
}: BillingInvoiceFooterProps) => {
    return (
        <StyledTableFooter>
            {subTotal || !taxAmount ? (
                <StyledTableFooterRow>
                    <StyledTableFooterCell>Sub total</StyledTableFooterCell>
                    <StyledTableFooterCell>
                        <StyledAmountCell>
                            {formatCurrency(subTotal || totalAmount, currency)}
                        </StyledAmountCell>
                    </StyledTableFooterCell>
                </StyledTableFooterRow>
            ) : null}
            <StyledTableFooterRow>
                <TaxRow value={taxAmount} />
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
