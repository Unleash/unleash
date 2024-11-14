import { styled } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ReactComponent as ProjectStatusSvg } from 'assets/icons/projectStatus.svg';
import { ProjectResources } from './ProjectResources';
import { ProjectActivity } from './ProjectActivity';
import { ProjectHealth } from './ProjectHealth';
import { ProjectLifecycleSummary } from './ProjectLifecycleSummary';
import { StaleFlags } from './StaleFlags';
import type { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';

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
}));

const StyledProjectStatusSvg = styled(ProjectStatusSvg)(({ theme }) => ({
    fill: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
}));

const ModalHeader = styled('h3')(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    margin: 0,
}));

const RowHeader = styled('h4')(({ theme }) => ({
    margin: 0,
    fontWeight: 'normal',
}));

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const TooltipContent = styled('div')(({ theme }) => ({
    padding: theme.spacing(0.5),
}));

const TooltipText = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    '& + p': {
        marginTop: theme.spacing(1),
    },
}));

const LifecycleTooltip: FC = () => {
    return (
        <HelpIcon
            htmlTooltip
            htmlTooltipMaxWidth='550px'
            tooltip={
                <TooltipContent>
                    <TooltipText>
                        Based on usage metrics and interactions with Unleash,
                        feature flags can go through five distinct lifecycle
                        stages. These stages mirror the typical software
                        development process and allow you to identify
                        bottlenecks at any stage of the lifecycle.
                    </TooltipText>

                    <TooltipText>
                        <a href='https://docs.getunleash.io/reference/feature-toggles#feature-flag-lifecycle'>
                            Read more in our documentation
                        </a>
                    </TooltipText>
                </TooltipContent>
            }
        />
    );
};

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <DynamicSidebarModal open={open} onClose={close} label='Project status'>
            <ModalContentContainer>
                <HeaderRow>
                    <StyledProjectStatusSvg aria-hidden='true' />
                    <ModalHeader>Project status</ModalHeader>
                </HeaderRow>
                <Row>
                    <RowHeader>Health</RowHeader>
                    <HealthContainer>
                        <HealthGrid>
                            <ProjectHealth />
                            <StaleFlags />
                            <ProjectResources />
                        </HealthGrid>
                    </HealthContainer>
                </Row>

                <Row>
                    <RowHeader>Activity in project</RowHeader>
                    <ProjectActivity />
                </Row>

                <Row>
                    <HeaderRow>
                        <RowHeader>Flag lifecycle</RowHeader>
                        <LifecycleTooltip />
                    </HeaderRow>
                    <ProjectLifecycleSummary />
                </Row>
            </ModalContentContainer>
        </DynamicSidebarModal>
    );
};
