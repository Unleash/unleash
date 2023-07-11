import { styled } from '@mui/material';
import { DELETE_PROJECT } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DeleteProjectDialogue } from '../../DeleteProject/DeleteProjectDialogue';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const StyledContainer = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledTitle = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(4),
    lineHeight: 2,
}));

const StyledCounter = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(3),
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(3),
}));

interface IDeleteProjectProps {
    projectId: string;
    featureCount: number;
}

export const DeleteProject = ({
    projectId,
    featureCount,
}: IDeleteProjectProps) => {
    const [showDelDialog, setShowDelDialog] = useState(false);
    const navigate = useNavigate();
    return (
        <StyledContainer>
            <StyledTitle>Delete project</StyledTitle>
            <div>
                Before you can delete a project, you must first archive all the
                feature toggles associated with it. Keep in mind that deleting a
                project will permanently remove all the archived feature
                toggles, and they cannot be recovered once deleted.
            </div>
            <StyledCounter>
                Currently there are{' '}
                <strong>{featureCount} feature toggles active</strong>
            </StyledCounter>
            <StyledButtonContainer>
                <PermissionButton
                    permission={DELETE_PROJECT}
                    disabled={featureCount > 0}
                    projectId={projectId}
                    onClick={() => {
                        setShowDelDialog(true);
                    }}
                    tooltipProps={{
                        title: 'Delete project',
                    }}
                    data-loading
                >
                    Delete project
                </PermissionButton>
            </StyledButtonContainer>
            <DeleteProjectDialogue
                project={projectId}
                open={showDelDialog}
                onClose={() => {
                    setShowDelDialog(false);
                }}
                onSuccess={() => {
                    navigate('/projects');
                }}
            />
        </StyledContainer>
    );
};
