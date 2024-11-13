import { Box, styled, Typography } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ProjectResources } from './ProjectResources';
import { ProjectActivity } from './ProjectActivity';
import { ProjectHealth } from './ProjectHealth';
import { ProjectLifecycleSummary } from './ProjectLifecycleSummary';

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

const HealthContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
        "health resources"
        "stale resources"
    `,
    gridTemplateColumns: '1fr 1fr',
    // padding: theme.spacing(2),
    gap: theme.spacing(2),
}));

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <DynamicSidebarModal open={open} onClose={close} label='Project status'>
            <ModalContentContainer>
                <HealthContainer>
                    <ProjectHealth />
                    <ProjectResources />
                    <Box gridArea='stale'>
                        <Typography variant='h3'>Stale flags</Typography>
                        <Typography>
                            Flags that have not been used for a long time and
                            can be archived.
                        </Typography>
                    </Box>
                </HealthContainer>

                <ProjectActivity />

                <ProjectLifecycleSummary />
            </ModalContentContainer>
        </DynamicSidebarModal>
    );
};
