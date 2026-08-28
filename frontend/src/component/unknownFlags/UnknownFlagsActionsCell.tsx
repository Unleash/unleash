import { Box, styled } from '@mui/material';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import type { UnknownFlag } from './hooks/useUnknownFlags.js';
import { useNavigate } from 'react-router';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.js';
import type { ProjectSchema } from 'openapi/index.js';

const StyledBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
}));

interface IUnknownFlagsActionsCellProps {
    unknownFlag: UnknownFlag;
    suggestedProject?: ProjectSchema;
}

export const UnknownFlagsActionsCell = ({
    unknownFlag,
    suggestedProject,
}: IUnknownFlagsActionsCellProps) => {
    const navigate = useNavigate();

    if (!suggestedProject) return null;

    return (
        <StyledBox>
            <PermissionButton
                variant='text'
                size='medium'
                permission={CREATE_FEATURE}
                projectId={suggestedProject.id}
                onClick={() =>
                    navigate(
                        `/projects/${suggestedProject.id}?create=true&name=${unknownFlag.name}`,
                    )
                }
            >
                Create flag
            </PermissionButton>
        </StyledBox>
    );
};
