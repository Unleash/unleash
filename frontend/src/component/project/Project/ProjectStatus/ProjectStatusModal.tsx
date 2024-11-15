import { Button, styled } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ReactComponent as ProjectStatusSvg } from 'assets/icons/projectStatus.svg';
import { ProjectActivity } from './ProjectActivity';
import { ProjectLifecycleSummary } from './ProjectLifecycleSummary';
import type { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ProjectHealthGrid } from './ProjectHealthGrid';

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

const WidgetContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(9),
}));

type Props = {
    open: boolean;
    close: () => void;
};

const LifecycleHeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'end',
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

const RowHeader = styled('h4')(({ theme }) => ({
    margin: 0,
    fontWeight: 'normal',
}));

const Row = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
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

const CloseRow = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    marginBlockStart: 'auto',
}));

export const ProjectStatusModal = ({ open, close }: Props) => {
    return (
        <DynamicSidebarModal
            open={open}
            onClose={close}
            label='Project status'
            onClick={(e: React.SyntheticEvent) => {
                if (e.target instanceof HTMLAnchorElement) {
                    // close sidebar when you click a link inside it
                    close();
                }
            }}
        >
            <ModalContentContainer>
                <HeaderRow>
                    <StyledProjectStatusSvg aria-hidden='true' />
                    <ModalHeader>Project status</ModalHeader>
                </HeaderRow>
                <WidgetContainer>
                    <Row>
                        <RowHeader>Health</RowHeader>
                        <ProjectHealthGrid />
                    </Row>

                    <Row>
                        <RowHeader>Activity in project</RowHeader>
                        <ProjectActivity />
                    </Row>

                    <Row>
                        <LifecycleHeaderRow>
                            <RowHeader>Flag lifecycle</RowHeader>
                            <LifecycleTooltip />
                        </LifecycleHeaderRow>
                        <ProjectLifecycleSummary />
                    </Row>
                </WidgetContainer>
                <CloseRow>
                    <Button variant='outlined' onClick={close}>
                        Close
                    </Button>
                </CloseRow>
            </ModalContentContainer>
        </DynamicSidebarModal>
    );
};
