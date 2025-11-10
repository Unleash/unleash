import { PageContent } from 'component/common/PageContent/PageContent';
import { useEffect } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { Alert, Box, styled, Typography } from '@mui/material';
import { BillingDashboard } from './BillingDashboard/BillingDashboard.tsx';
import { BillingHistory } from './BillingHistory/BillingHistory.tsx';
import useInvoices from 'hooks/api/getters/useInvoices/useInvoices';
import { BillingInvoices } from './BillingInvoices/BillingInvoices.tsx';
import { BillingInfo } from './BillingInfo/BillingInfo.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    color: theme.palette.text.primary,
}));

const StyledPageGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        display: 'flex',
        flexDirection: 'column-reverse',
    },
}));

export const Billing = () => {
    const { isBilling, refetchInstanceStatus, refresh, loading } =
        useInstanceStatus();
    const { invoices } = useInvoices();
    const {
        uiConfig: { billing },
    } = useUiConfig();

    const eligibleForDetailedBilling =
        billing === 'pay-as-you-go' || billing === 'enterprise-consumption';

    useEffect(() => {
        const hardRefresh = async () => {
            await refresh();
            refetchInstanceStatus();
        };
        hardRefresh();
    }, [refetchInstanceStatus, refresh]);

    if (eligibleForDetailedBilling) {
        return (
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing(4),
                })}
            >
                <StyledHeader>Usage and invoices</StyledHeader>
                <StyledPageGrid>
                    <BillingInvoices />
                    <div>
                        <BillingInfo />
                    </div>
                </StyledPageGrid>
            </Box>
        );
    }

    return (
        <div>
            <PageContent header='Billing' isLoading={loading}>
                <ConditionallyRender
                    condition={isBilling}
                    show={
                        <PermissionGuard permissions={ADMIN}>
                            <>
                                <BillingDashboard />
                                <BillingHistory data={invoices} />
                            </>
                        </PermissionGuard>
                    }
                    elseShow={
                        <Alert severity='error'>
                            Billing is not enabled for this instance.
                        </Alert>
                    }
                />
            </PageContent>
        </div>
    );
};
