import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Alert, Link, styled } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { ChangeRequestTable } from './ChangeRequestTable';
import {
    PlausibleOrigin,
    PremiumFeature,
} from 'component/common/PremiumFeature/PremiumFeature';

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    width: 'fit-content',
}));

export const ChangeRequestConfiguration = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss, uiConfig } = useUiConfig();
    const isPro = !(
        Boolean(uiConfig.versionInfo?.current.oss) ||
        Boolean(uiConfig.versionInfo?.current.enterprise)
    );
    usePageTitle(`Project change request – ${projectName}`);

    if (isOss() || isPro) {
        return (
            <PageContent
                header={<PageHeader title="Change request configuration" />}
                sx={{ justifyContent: 'center' }}
            >
                <PremiumFeature
                    origin={PlausibleOrigin.CHANGE_REQUEST}
                    enterpriseOnly
                    center
                >
                    <>
                        If you want to use{' '}
                        <StyledLink
                            href={'https://www.getunleash.io/plans'} // TODO: Add link to change request docs when available
                            target="_blank"
                        >
                            "Change Requests"
                        </StyledLink>{' '}
                        you will need to upgrade to Enterprise plan
                    </>
                </PremiumFeature>
            </PageContent>
        );
    }

    if (!hasAccess(UPDATE_PROJECT, projectId)) {
        return (
            <PageContent header={<PageHeader title="Project access" />}>
                <Alert severity="error">
                    You need project owner permissions to access this section.
                </Alert>
            </PageContent>
        );
    }

    return <ChangeRequestTable />;
};
