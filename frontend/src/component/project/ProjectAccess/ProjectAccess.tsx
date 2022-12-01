import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Alert, Box, Link, styled } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { ProjectAccessTable } from 'component/project/ProjectAccess/ProjectAccessTable/ProjectAccessTable';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { ProFeatureTooltip } from '../../common/ProFeatureTooltip/ProFeatureTooltip';

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    width: 'fit-content',
}));

export const ProjectAccess = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { isOss } = useUiConfig();
    usePageTitle(`Project access – ${projectName}`);

    if (isOss()) {
        return (
            <PageContent header={<PageHeader title="Project access" />}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        maxWidth: '50%',
                        margin: '0 25%',
                    }}
                    alignSelf={'center'}
                >
                    <ProFeatureTooltip
                        title={'Pro & Enterprise feature'}
                        origin={'Project Change Request Configuration'}
                        center
                    >
                        <>
                            Controlling access to projects requires a paid
                            version of Unleash. Check out{' '}
                            <StyledLink
                                href="https://www.getunleash.io"
                                target="_blank"
                                rel="noreferrer"
                            >
                                getunleash.io
                            </StyledLink>{' '}
                            to find out more.
                        </>
                    </ProFeatureTooltip>
                </Box>
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

    return <ProjectAccessTable />;
};
