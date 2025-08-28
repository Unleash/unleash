import Add from '@mui/icons-material/Add';
import { Box, styled } from '@mui/material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import type { UnknownFlag } from './hooks/useUnknownFlags.js';
import { Link } from 'react-router-dom';
import useProjects from 'hooks/api/getters/useProjects/useProjects.js';
import { DEFAULT_PROJECT_ID } from 'hooks/api/getters/useDefaultProject/useDefaultProjectId.js';

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

    const project = projects.find(({ id }) => id === DEFAULT_PROJECT_ID)
        ? DEFAULT_PROJECT_ID
        : projects[0]?.id || DEFAULT_PROJECT_ID;

    return (
        <StyledBox>
            <PermissionIconButton
                component={Link}
                data-loading
                to={`/projects/${project}?create=true&name=${unknownFlag.name}`}
                permission={CREATE_FEATURE}
                tooltipProps={{
                    title: 'Create feature flag',
                }}
            >
                <Add />
            </PermissionIconButton>
        </StyledBox>
    );
};
