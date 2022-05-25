import AdminMenu from '../menu/AdminMenu';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useContext } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { Alert } from '@mui/material';
import { BillingDashboard } from './BillingDashboard/BillingDashboard';
import { BillingHistory } from './BillingHistory/BillingHistory';
import useInvoices from 'hooks/api/getters/useInvoices/useInvoices';

export const Billing = () => {
    const { instanceStatus, isBilling } = useInstanceStatus();
    const { invoices } = useInvoices();
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <AdminMenu />
            <PageContent header="Billing">
                <ConditionallyRender
                    condition={isBilling}
                    show={
                        <ConditionallyRender
                            condition={hasAccess(ADMIN)}
                            show={() => (
                                <>
                                    <BillingDashboard
                                        instanceStatus={instanceStatus!}
                                    />
                                    <BillingHistory data={invoices} />
                                </>
                            )}
                            elseShow={() => <AdminAlert />}
                        />
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
