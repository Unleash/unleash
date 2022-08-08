import { Dialogue } from 'component/common/Dialogue/Dialogue';
import React from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';

interface IDeleteProjectDialogueProps {
    project: string;
    open: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

export const DeleteProjectDialogue = ({
    open,
    onClose,
    project,
    onSuccess,
}: IDeleteProjectDialogueProps) => {
    const { deleteProject } = useProjectApi();
    const { refetch: refetchProjectOverview } = useProjects();
    const { setToastData, setToastApiError } = useToast();

    const onClick = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            await deleteProject(project);
            refetchProjectOverview();
            setToastData({
                title: 'Deleted project',
                type: 'success',
                text: 'Successfully deleted project',
            });
            onSuccess?.();
        } catch (ex: unknown) {
            setToastApiError(formatUnknownError(ex));
        }
        onClose?.();
    };

    return (
        <Dialogue
            open={open}
            onClick={onClick}
            onClose={onClose}
            title="Really delete project"
        />
    );
};
