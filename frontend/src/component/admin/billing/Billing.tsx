import { PageContent } from 'component/common/PageContent/PageContent';
import { useEffect } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { Alert } from '@mui/material';
import { BillingDashboard } from './BillingDashboard/BillingDashboard';
import { BillingHistory } from './BillingHistory/BillingHistory';
import useInvoices from 'hooks/api/getters/useInvoices/useInvoices';

export const Billing = () => {
    const {
        instanceStatus,
        isBilling,
        refetchInstanceStatus,
        refresh,
        loading,
    } = useInstanceStatus();
    const { invoices } = useInvoices();

    useEffect(() => {
        const hardRefresh = async () => {
            await refresh();
            refetchInstanceStatus();
        };
        hardRefresh();
    }, [refetchInstanceStatus, refresh]);

    return (
        <div>
            <PageContent header="Billing" isLoading={loading}>
                <ConditionallyRender
                    condition={isBilling}
                    show={
                        <PermissionGuard permissions={ADMIN}>
                            <>
                                <BillingDashboard
                                    instanceStatus={instanceStatus!}
                                />
                                <BillingHistory data={invoices} />
                            </>
                        </PermissionGuard>
                    }
                    elseShow={
                        <Alert severity="error">
                            Billing is not enabled for this instance.
                        </Alert>
                    }
                />
            </PageContent>
        </div>
    );
};
