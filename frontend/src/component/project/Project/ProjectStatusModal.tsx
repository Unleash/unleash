import { styled } from '@mui/material';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';

const ModalContentContainer = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    backgroundColor: theme.palette.background.default,
}));

type Props = {
    open: boolean;
    close: () => void;
};

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <SidebarModal open={open} onClose={close} label='Import toggles'>
            <ModalContentContainer />
        </SidebarModal>
    );
};
