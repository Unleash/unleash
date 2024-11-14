import { styled } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ReactComponent as ProjectStatusSvg } from 'assets/icons/projectStatus.svg';
import { ProjectResources } from './ProjectResources';
import { ProjectActivity } from './ProjectActivity';
import { ProjectHealth } from './ProjectHealth';
import { ProjectLifecycleSummary } from './ProjectLifecycleSummary';
import { StaleFlags } from './StaleFlags';

const ModalContentContainer = styled('section')(({ theme }) => ({
    minHeight: '100vh',
    maxWidth: 1100,
    width: '95vw',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(4),
    paddingInline: theme.spacing(4),
    paddingBlock: theme.spacing(10),
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

const HeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledProjectStatusSvg = styled(ProjectStatusSvg)(({ theme }) => ({
    fill: theme.palette.primary.main,
}));

const ModalHeader = styled('h3')(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    margin: 0,
}));

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <DynamicSidebarModal open={open} onClose={close} label='Project status'>
            <ModalContentContainer>
                <HeaderRow>
                    <StyledProjectStatusSvg aria-hidden='true' />
                    <ModalHeader>Project status</ModalHeader>
                </HeaderRow>
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
