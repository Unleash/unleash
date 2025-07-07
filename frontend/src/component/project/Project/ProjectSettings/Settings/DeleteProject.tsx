import { styled } from '@mui/material';
import { DELETE_PROJECT } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DeleteProjectDialogue } from '../../DeleteProject/DeleteProjectDialogue.tsx';
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
    projectName?: string;
    featureCount: number;
}

export const DeleteProject = ({
    projectId,
    projectName,
    featureCount,
}: IDeleteProjectProps) => {
    const { isEnterprise } = useUiConfig();
    const automatedActionsEnabled = useUiFlag('automatedActions');
    const { actions } = useActions(projectId);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const actionsCount = actions.filter(({ enabled }) => enabled).length;
    const navigate = useNavigate();
    return (
        <StyledContainer>
            <p>
                Before you can delete a project, you must first archive all the
                feature flags associated with it
                {isEnterprise() && automatedActionsEnabled
                    ? ' and disable all actions that are in it'
                    : ''}
                .
            </p>
            <ConditionallyRender
                condition={featureCount > 0}
                show={
                    <p>
                        Currently there {featureCount <= 1 ? 'is' : 'are'}{' '}
                        <strong>
                            {featureCount} active feature{' '}
                            {featureCount === 1 ? 'flag' : 'flags'}.
                        </strong>
                    </p>
                }
            />
            <ConditionallyRender
                condition={
                    isEnterprise() &&
                    automatedActionsEnabled &&
                    actionsCount > 0
                }
                show={
                    <p>
                        Currently there {actionsCount <= 1 ? 'is' : 'are'}{' '}
                        <strong>
                            {actionsCount} enabled{' '}
                            {actionsCount === 1 ? 'action' : 'actions'}.
                        </strong>
                    </p>
                }
            />
            <p>
                Keep in mind that deleting a project{' '}
                <strong>will permanently remove</strong>
                <ul>
                    <li>all archived feature flags in this project</li>
                    <li>API keys configured to access only this project</li>
                    <ConditionallyRender
                        condition={isEnterprise() && automatedActionsEnabled}
                        show={<li>all actions configured for this project</li>}
                    />
                </ul>
                and they <strong>cannot be recovered</strong> once deleted.
            </p>
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
                projectId={projectId}
                projectName={projectName}
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
