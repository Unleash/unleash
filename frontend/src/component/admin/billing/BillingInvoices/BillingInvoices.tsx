import { Box, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { BillingInvoice } from './BillingInvoice/BillingInvoice.tsx';
import { useDetailedInvoices } from 'hooks/api/getters/useDetailedInvoices/useDetailedInvoices.ts';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    fontWeight: theme.fontWeight.semi,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
}));

export const BillingInvoices: FC = () => {
    const { invoices } = useDetailedInvoices();

    return (
        <StyledContainer>
            <StyledHeader>Usage and invoices</StyledHeader>
            {invoices.map((invoice) => (
                <BillingInvoice key={invoice.invoiceDate} {...invoice} />
            ))}
        </StyledContainer>
    );
};
