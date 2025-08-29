import Add from '@mui/icons-material/Add';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import type { UnknownFlag } from './hooks/useUnknownFlags.js';
import { Link } from 'react-router-dom';
import useProjects from 'hooks/api/getters/useProjects/useProjects.js';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId.js';
import AccessContext from 'contexts/AccessContext.js';
import { useContext } from 'react';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface IUnknownFlagsActionsCellProps {
    unknownFlag: UnknownFlag;
}

export const UnknownFlagsActionsCell = ({
    unknownFlag,
}: IUnknownFlagsActionsCellProps) => {
    const { projects } = useProjects();
    const { hasAccess } = useContext(AccessContext);

    let project =
        projects.find(({ id }) => id === DEFAULT_PROJECT_ID) || projects[0];
    if (!hasAccess(CREATE_FEATURE, project?.id)) {
        for (const proj of projects) {
            if (hasAccess(CREATE_FEATURE, proj.id)) {
                project = proj;
                break;
            }
        }
    }

    return (
        <StyledBox>
            <PermissionIconButton
                component={Link}
                data-loading
                to={`/projects/${project?.id}?create=true&name=${unknownFlag.name}`}
                permission={CREATE_FEATURE}
                projectId={project?.id}
                tooltipProps={{
                    title: 'Create feature flag',
                }}
            >
                <Add />
            </PermissionIconButton>
        </StyledBox>
    );
};
