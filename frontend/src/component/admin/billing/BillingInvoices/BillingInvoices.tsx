import { Box, styled } from '@mui/material';
import type { FC } from 'react';
import { BillingInvoice } from './BillingInvoice/BillingInvoice.tsx';
import { useDetailedInvoices } from 'hooks/api/getters/useDetailedInvoices/useDetailedInvoices.ts';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

export const BillingInvoices: FC = () => {
    const { invoices } = useDetailedInvoices();

    return (
        <StyledContainer>
            {invoices.map((invoice) => (
                <BillingInvoice key={invoice.invoiceDate} {...invoice} />
            ))}
        </StyledContainer>
    );
};
