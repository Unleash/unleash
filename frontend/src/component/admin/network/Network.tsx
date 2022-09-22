import AdminMenu from '../menu/AdminMenu';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useContext, useEffect } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { NetworkDashboard } from './NetworkDashboard/NetworkDashboard';

export const Network = () => {
    const { instanceStatus, refetchInstanceStatus, refresh, loading } =
        useInstanceStatus();
    const { hasAccess } = useContext(AccessContext);

    useEffect(() => {
        const hardRefresh = async () => {
            await refresh();
            refetchInstanceStatus();
        };
        hardRefresh();
    }, [refetchInstanceStatus, refresh]);

    return (
        <div>
            <AdminMenu />
            <PageContent header="Network" isLoading={loading}>
                <ConditionallyRender
                    condition={hasAccess(ADMIN)}
                    show={() => (
                        <>
                            <NetworkDashboard
                                instanceStatus={instanceStatus!}
                            />
                        </>
                    )}
                    elseShow={() => <AdminAlert />}
                />
            </PageContent>
        </div>
    );
};
