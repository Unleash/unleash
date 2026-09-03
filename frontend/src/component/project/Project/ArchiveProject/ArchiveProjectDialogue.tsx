import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type React from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';
import { Typography } from '@mui/material';
import type { Tracking } from 'utils/trackingEvents';
import { useTracking } from 'hooks/useTracking';

interface IDeleteProjectDialogueProps {
    project: string;
    open: boolean;
    onClose: (e: React.SyntheticEvent) => void;
    onSuccess?: () => void;
    tracking?: Tracking;
}

export const ArchiveProjectDialogue = ({
    open,
    onClose,
    project,
    onSuccess,
    tracking,
}: IDeleteProjectDialogueProps) => {
    const { archiveProject, loading } = useProjectApi();
    const { trackMutation } = useTracking(tracking);
    const { refetch: refetchProjectOverview } = useProjects();
    const { setToastData, setToastApiError } = useToast();

    const onClick = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            await trackMutation(() => archiveProject(project));
            refetchProjectOverview();
            setToastData({
                text: 'Project archived',
                type: 'success',
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
            disabledPrimaryButton={loading}
            tracking={tracking}
        >
            <Typography>
                The project will be moved to the projects archive, where it can
                either be revived or permanently deleted.
            </Typography>
        </Dialogue>
    );
};
