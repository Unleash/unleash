import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type React from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Typography } from '@mui/material';

interface IDeleteProjectDialogueProps {
    project: string;
    open: boolean;
    onClose: (e: React.SyntheticEvent) => void;
    onSuccess?: () => void;
}

export const DeleteProjectDialogue = ({
    open,
    onClose,
    project,
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
            await deleteProject(project);
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
            title='Really delete project'
        >
            <Typography>
                This will irreversibly remove the project, all feature flags
                archived in it, all API keys scoped to only this project
                <ConditionallyRender
                    condition={isEnterprise() && automatedActionsEnabled}
                    show=', and all actions configured for it'
                />
                .
            </Typography>
        </Dialogue>
    );
};
