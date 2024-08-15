import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

type ReviveProjectDialogProps = {
    name: string;
    id: string;
    open: boolean;
    onClose: () => void;
};

export const ReviveProjectDialog = ({
    name,
    id,
    open,
    onClose,
}: ReviveProjectDialogProps) => {
    const { reviveProject } = useProjectApi();
    const { refetch: refetchProjects } = useProjects();
    const { refetch: refetchProjectArchive } = useProjects({ archived: true });
    const { setToastData, setToastApiError } = useToast();

    const onClick = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            await reviveProject(id);
            refetchProjects();
            refetchProjectArchive();
            setToastData({
                title: 'Restored project',
                type: 'success',
                text: 'Successfully restored project',
            });
        } catch (ex: unknown) {
            setToastApiError(formatUnknownError(ex));
        }
        onClose();
    };

    return (
        <Dialogue
            open={open}
            secondaryButtonText='Close'
            onClose={onClose}
            onClick={onClick}
            title='Restore archived project'
        >
            Are you sure you'd like to restore project <strong>{name}</strong>{' '}
            (id: <code>{id}</code>)?
            {/* TODO: more explanation */}
        </Dialogue>
    );
};
