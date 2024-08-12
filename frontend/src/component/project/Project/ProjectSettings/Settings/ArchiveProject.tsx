import { styled } from '@mui/material';
import { DELETE_PROJECT } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUiFlag } from 'hooks/useUiFlag';
import { useActions } from 'hooks/api/getters/useActions/useActions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ArchiveProjectDialogue } from '../../ArchiveProject/ArchiveProjectDialogue';

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

export const ArchiveProject = ({
    projectId,
    featureCount,
}: IDeleteProjectProps) => {
    const { isEnterprise } = useUiConfig();
    const automatedActionsEnabled = useUiFlag('automatedActions');
    const archiveProjectsEnabled = useUiFlag('archiveProjects');
    const { actions } = useActions(projectId);
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const actionsCount = actions.filter(({ enabled }) => enabled).length;
    const navigate = useNavigate();
    return (
        <StyledContainer>
            <p>
                Before you can archive a project, you must first archive all the
                feature flags associated with it
                {isEnterprise() && automatedActionsEnabled
                    ? ' and disable all actions that are in it'
                    : ''}
                .
            </p>
            {featureCount > 0 ? (
                <p>
                    Currently there {featureCount <= 1 ? 'is' : 'are'}{' '}
                    <strong>
                        {featureCount} active feature{' '}
                        {featureCount === 1 ? 'flag' : 'flags'}.
                    </strong>
                </p>
            ) : null}
            {isEnterprise() && automatedActionsEnabled && actionsCount > 0 ? (
                <p>
                    Currently there {actionsCount <= 1 ? 'is' : 'are'}{' '}
                    <strong>
                        {actionsCount} enabled{' '}
                        {actionsCount === 1 ? 'action' : 'actions'}.
                    </strong>
                </p>
            ) : null}
            <StyledButtonContainer>
                <PermissionButton
                    permission={DELETE_PROJECT}
                    disabled={featureCount > 0}
                    projectId={projectId}
                    onClick={() => {
                        setShowArchiveDialog(true);
                    }}
                    tooltipProps={{
                        title: 'Archive project',
                    }}
                    data-loading
                >
                    Archive project
                </PermissionButton>
            </StyledButtonContainer>
            <ArchiveProjectDialogue
                project={projectId}
                open={showArchiveDialog}
                onClose={() => {
                    setShowArchiveDialog(false);
                }}
                onSuccess={() => {
                    navigate('/projects');
                }}
            />
        </StyledContainer>
    );
};
