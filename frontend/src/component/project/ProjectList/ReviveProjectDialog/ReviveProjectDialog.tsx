import { styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ProjectId } from 'component/project/ProjectId/ProjectId';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useNavigate } from 'react-router-dom';

type ReviveProjectDialogProps = {
    name: string;
    id: string;
    open: boolean;
    onClose: () => void;
};

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
    const navigate = useNavigate();

    const onClick = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            await reviveProject(id);
            refetchProjects();
            refetchProjectArchive();
            navigate(`/projects/${id}`);
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
            onClose={onClose}
            onClick={onClick}
            title='Revive an archived project'
        >
            <StyledParagraph>
                Are you sure you'd like to revive project{' '}
                <strong>{name}</strong>?
            </StyledParagraph>
            <StyledParagraph>
                Project ID: <ProjectId>{id}</ProjectId>
            </StyledParagraph>
            <StyledParagraph>
                All flags in the revived project will remain archived.
            </StyledParagraph>
        </Dialogue>
    );
};
