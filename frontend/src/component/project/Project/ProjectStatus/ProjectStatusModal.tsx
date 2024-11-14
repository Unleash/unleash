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

const onNarrowGrid = (css: object) => ({
    '@container (max-width: 650px)': css,
    '@supports not (container-type: inline-size)': {
        '@media (max-width: 712px)': css,
    },
});

const HealthContainer = styled('div')({
    containerType: 'inline-size',
});

const HealthGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
        "health resources"
        "stale resources"
    `,
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(1, 2),
    ...onNarrowGrid({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    }),
}));

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <DynamicSidebarModal open={open} onClose={close} label='Project status'>
            <ModalContentContainer>
                <HealthContainer>
                    <HealthGrid>
                        <ProjectHealth />
                        <StaleFlags />
                        <ProjectResources />
                    </HealthGrid>
                </HealthContainer>

                <ProjectActivity />

                <ProjectLifecycleSummary />
            </ModalContentContainer>
        </DynamicSidebarModal>
    );
};
