import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type React from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';
import { Typography } from '@mui/material';

interface IDeleteProjectDialogueProps {
    project: string;
    open: boolean;
    onClose: (e: React.SyntheticEvent) => void;
    onSuccess?: () => void;
}

export const ArchiveProjectDialogue = ({
    open,
    onClose,
    project,
    onSuccess,
}: IDeleteProjectDialogueProps) => {
    const { archiveProject } = useProjectApi();
    const { refetch: refetchProjectOverview } = useProjects();
    const { setToastData, setToastApiError } = useToast();

    const onClick = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            await archiveProject(project);
            refetchProjectOverview();
            setToastData({
                title: 'Archived project',
                type: 'success',
                text: 'Successfully archived project',
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
            <Typography>
                The project will be moved to the projects archive, where it can
                either be revived or permanently deleted.
            </Typography>
        </Dialogue>
    );
};
