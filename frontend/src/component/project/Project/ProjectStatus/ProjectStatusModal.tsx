import { styled } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ProjectResources } from './ProjectResources';
import { ProjectActivity } from './ProjectActivity';
import { ProjectHealth } from './ProjectHealth';
import { ProjectLifecycleSummary } from './ProjectLifecycleSummary';
import { StaleFlags } from './StaleFlags';

const ModalContentContainer = styled('div')(({ theme }) => ({
    minHeight: '100vh',
    maxWidth: 1000,
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

const HealthContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
        "health resources"
        "stale resources"
    `,
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(1, 2),
}));

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <DynamicSidebarModal open={open} onClose={close} label='Project status'>
            <ModalContentContainer>
                <HealthContainer>
                    <ProjectHealth />
                    <StaleFlags />
                    <ProjectResources />
                </HealthContainer>

                <ProjectActivity />

                <ProjectLifecycleSummary />
            </ModalContentContainer>
        </DynamicSidebarModal>
    );
};
