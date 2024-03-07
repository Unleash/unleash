import { styled } from '@mui/material';
import { DELETE_PROJECT } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DeleteProjectDialogue } from '../../DeleteProject/DeleteProjectDialogue';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUiFlag } from 'hooks/useUiFlag';
import { useActions } from 'hooks/api/getters/useActions/useActions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(4),
    gap: theme.spacing(2),
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
    const { isEnterprise } = useUiConfig();
    const automatedActionsEnabled = useUiFlag('automatedActions');
    const { actions } = useActions(projectId);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const navigate = useNavigate();
    return (
        <StyledContainer>
            <p>
                Before you can delete a project, you must first archive all the
                feature toggles associated with it. Keep in mind that deleting a
                project will permanently remove all the archived feature
                toggles, and they cannot be recovered once deleted.
            </p>
            <ConditionallyRender
                condition={isEnterprise() && automatedActionsEnabled}
                show={
                    <p>
                        Additionally, all configured actions for this project
                        will no longer be executed as they will be permanently
                        deleted.
                    </p>
                }
            />
            <p>
                Currently there are{' '}
                <strong>{featureCount} feature toggles active</strong>
            </p>
            <ConditionallyRender
                condition={isEnterprise() && automatedActionsEnabled}
                show={
                    <p>
                        Currently there are{' '}
                        <strong>
                            {actions.filter(({ enabled }) => enabled).length}{' '}
                            enabled actions
                        </strong>
                    </p>
                }
            />
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
