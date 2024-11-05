import { styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ProjectResources } from './ProjectResources';
import { ProjectActivity } from './ProjectActivity';

const ModalContentContainer = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
}));

type Props = {
    open: boolean;
    close: () => void;
};

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <SidebarModal open={open} onClose={close} label='Project status'>
            <ModalContentContainer>
                <ProjectResources />
                <ProjectActivity />
            </ModalContentContainer>
        </SidebarModal>
    );
};
