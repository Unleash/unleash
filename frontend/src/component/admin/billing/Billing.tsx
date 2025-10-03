import { PageContent } from 'component/common/PageContent/PageContent';
import { useEffect } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { Alert, Box } from '@mui/material';
import { BillingDashboard } from './BillingDashboard/BillingDashboard.tsx';
import { BillingHistory } from './BillingHistory/BillingHistory.tsx';
import useInvoices from 'hooks/api/getters/useInvoices/useInvoices';
import { useUiFlag } from 'hooks/useUiFlag';
import { BillingInvoices } from './BillingInvoices/BillingInvoices.tsx';

export const Billing = () => {
    const { isBilling, refetchInstanceStatus, refresh, loading } =
        useInstanceStatus();
    const { invoices } = useInvoices();
    const trafficBillingDisplay = useUiFlag('trafficBillingDisplay');

    useEffect(() => {
        const hardRefresh = async () => {
            await refresh();
            refetchInstanceStatus();
        };
        hardRefresh();
    }, [refetchInstanceStatus, refresh]);

    if (trafficBillingDisplay) {
        return (
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing(4),
                })}
            >
                <BillingDashboard />
                <BillingInvoices />
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
