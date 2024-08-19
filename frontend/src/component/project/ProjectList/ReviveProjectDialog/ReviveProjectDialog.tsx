import { styled, Typography } from '@mui/material';
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

const StyledId = styled('code')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation2,
    padding: theme.spacing(0.5, 1.5),
    display: 'inline-block',
    borderRadius: `${theme.shape.borderRadius}px`,
    fontSize: theme.typography.body2.fontSize,
}));

const StyledParagraph = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

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
                title: 'Revive project',
                type: 'success',
                text: 'Successfully revived project',
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
            title='Revive archived project'
        >
            <StyledParagraph>
                Are you sure you'd like to revive project{' '}
                <strong>{name}</strong>?
            </StyledParagraph>
            <StyledParagraph>
                Project ID: <StyledId>{id}</StyledId>
            </StyledParagraph>
            <StyledParagraph>
                All flags in revived project will still be archived.
            </StyledParagraph>
        </Dialogue>
    );
};
