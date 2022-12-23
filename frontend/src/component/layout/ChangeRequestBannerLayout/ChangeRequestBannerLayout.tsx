import { ReactNode, forwardRef } from 'react';
import { MainLayout } from 'component/layout/MainLayout/MainLayout';
import { DraftBanner } from './DraftBanner/DraftBanner';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';

interface IChangeRequestBannerLayoutProps {
    children?: ReactNode;
    projectId: string;
}

export const ChangeRequestBannerLayout = forwardRef<
    HTMLDivElement,
    IChangeRequestBannerLayoutProps
>(({ children, projectId }, ref) => {
    const { isChangeRequestConfiguredInAnyEnv } =
        useChangeRequestsEnabled(projectId);

    return (
        <MainLayout
            ref={ref}
            subheader={
                isChangeRequestConfiguredInAnyEnv() ? (
                    <DraftBanner project={projectId} />
                ) : null
            }
        >
            {children}
        </MainLayout>
    );
});
