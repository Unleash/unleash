import { Box, styled } from '@mui/material';
import type { FC } from 'react';
import { BillingInvoice } from './BillingInvoice/BillingInvoice.tsx';
import { useDetailedInvoices } from 'hooks/api/getters/useDetailedInvoices/useDetailedInvoices.ts';
import { TablePlaceholder } from 'component/common/Table';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

export const BillingInvoices: FC = () => {
    const { invoices, loading } = useDetailedInvoices();

    if (loading) {
        return <StyledContainer />;
    }

    return (
        <StyledContainer>
            {invoices.length > 0 ? (
                <>
                    {invoices.map((invoice, index) => (
                        <BillingInvoice
                            key={invoice.invoiceDate}
                            defaultExpanded={index === 0}
                            {...invoice}
                        />
                    ))}
                </>
            ) : (
                <TablePlaceholder>
                    There are no invoices or estimates available right now.
                </TablePlaceholder>
            )}
        </StyledContainer>
    );
};
