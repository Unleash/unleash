import { styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ProjectResources } from './ProjectResources';
import { ProjectActivity } from './ProjectActivity';

const ModalContentContainer = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(4),
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(4),
}));

type Props = {
    open: boolean;
    close: () => void;
};

const HealthRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    '&>*': {
        // todo: reconsider this value when the health widget is
        // implemented. It may not be right, but it works for the
        // placeholder
        flex: '30%',
    },
}));

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <SidebarModal open={open} onClose={close} label='Project status'>
            <ModalContentContainer>
                <HealthRow>
                    <div>Health widget placeholder</div>
                    <ProjectResources />
                </HealthRow>

                <ProjectActivity />
            </ModalContentContainer>
        </SidebarModal>
    );
};
