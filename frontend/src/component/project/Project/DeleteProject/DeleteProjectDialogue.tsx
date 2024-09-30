import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type React from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { styled, Typography } from '@mui/material';
import { ProjectId } from 'component/project/ProjectId/ProjectId';

interface IDeleteProjectDialogueProps {
    projectId: string;
    projectName?: string;
    open: boolean;
    onClose: (e: React.SyntheticEvent) => void;
    onSuccess?: () => void;
}

const StyledParagraph = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

export const DeleteProjectDialogue = ({
    open,
    onClose,
    projectId,
    projectName,
    onSuccess,
}: IDeleteProjectDialogueProps) => {
    const { deleteProject } = useProjectApi();
    const { refetch: refetchProjects } = useProjects();
    const { refetch: refetchProjectArchive } = useProjects({ archived: true });
    const { setToastData, setToastApiError } = useToast();
    const { isEnterprise } = useUiConfig();
    const automatedActionsEnabled = useUiFlag('automatedActions');

    const onClick = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            await deleteProject(projectId);
            refetchProjects();
            refetchProjectArchive();
            setToastData({
                title: 'Deleted project',
                type: 'success',
                text: 'Successfully deleted project',
            });
            onSuccess?.();
        } catch (ex: unknown) {
            setToastApiError(formatUnknownError(ex));
        }
        onClose(e);
    };

    return (
        <Dialogue
            open={open}
            onClick={onClick}
            onClose={onClose}
            title='Are you sure?'
        >
            <StyledParagraph>
                This will irreversibly remove:
                <ul>
                    <li>project with all of its settings</li>
                    <li>all feature flags archived in it</li>
                    <li>all API keys scoped only to this project</li>
                    <ConditionallyRender
                        condition={isEnterprise() && automatedActionsEnabled}
                        show={<li>all actions configured for it</li>}
                    />
                </ul>
            </StyledParagraph>
            <ConditionallyRender
                condition={Boolean(projectName)}
                show={
                    <>
                        <StyledParagraph>
                            Are you sure you'd like to permanently delete
                            project <strong>{projectName}</strong>?
                        </StyledParagraph>
                        <StyledParagraph>
                            Project ID: <ProjectId>{projectId}</ProjectId>
                        </StyledParagraph>
                    </>
                }
            />
        </Dialogue>
    );
};
