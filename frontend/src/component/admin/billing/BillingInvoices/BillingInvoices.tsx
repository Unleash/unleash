import { Box, styled } from '@mui/material';
import type { FC } from 'react';
import { BillingInvoice } from './BillingInvoice/BillingInvoice.tsx';
import { BillingInvoiceSkeleton } from './BillingInvoice/BillingInvoiceSkeleton.tsx';
import { useDetailedInvoices } from 'hooks/api/getters/useDetailedInvoices/useDetailedInvoices.ts';
import { TablePlaceholder } from 'component/common/Table';
import useLoading from 'hooks/useLoading';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const BillingInvoices: FC = () => {
    const { invoices, loading } = useDetailedInvoices();
    const ref = useLoading(loading);

    if (loading) {
        return (
            <StyledContainer ref={ref}>
                {[1, 2, 3].map((index) => (
                    <BillingInvoiceSkeleton key={index} />
                ))}
            </StyledContainer>
        );
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
