import { Box, styled } from '@mui/material';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useUiFlag } from 'hooks/useUiFlag';
import NotFound from 'component/common/NotFound/NotFound';

const StyledTitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const ImpactMetricsAdmin = () => {
    const externalImpactMetricsEnabled = useUiFlag('externalImpactMetrics');

    if (!externalImpactMetricsEnabled) {
        return <NotFound />;
    }

    return (
        <div>
            <PermissionGuard permissions={[ADMIN]}>
                <ImpactMetricsPage />
            </PermissionGuard>
        </div>
    );
};

const ImpactMetricsPage = () => {
    return (
        <PageContent
            header={
                <PageHeader
                    titleElement={
                        <StyledTitleRow>Impact Metrics</StyledTitleRow>
                    }
                />
            }
        />
    );
};
