import { Box, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { BillingInvoice } from './BillingInvoice/BillingInvoice.tsx';

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

type BillingInvoicesProps = {};

export const BillingInvoices: FC<BillingInvoicesProps> = () => {
    return (
        <StyledContainer>
            <StyledHeader>Usage and invoices</StyledHeader>
            <BillingInvoice status='upcoming' title='October 15th' />
        </StyledContainer>
    );
};
