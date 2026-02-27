import { Button, styled } from '@mui/material';
import { DynamicSidebarModal } from 'component/common/SidebarModal/SidebarModal';
import ProjectStatusSvg from 'assets/icons/projectStatus.svg?react';
import { ProjectActivity } from './ProjectActivity.tsx';
import { ProjectLifecycleSummary } from './ProjectLifecycleSummary.tsx';
import type { FC } from 'react';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ProjectHealthGrid } from './ProjectHealthGrid.tsx';
import { useFeedback } from 'component/feedbackNew/useFeedback';
import FeedbackIcon from '@mui/icons-material/ChatOutlined';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const ModalContentContainer = styled('section')(({ theme }) => ({
    minHeight: '100vh',
    maxWidth: 1100,
    width: '95vw',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(2.5),
    paddingInline: theme.spacing(4),
    paddingBlock: theme.spacing(3.75),
}));

const WidgetContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const LifecycleHeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'end',
}));

const HeaderRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginInlineEnd: theme.spacing(5), // to account for the close button
}));

const StyledProjectStatusSvg = styled(ProjectStatusSvg)(({ theme }) => ({
    fill: theme.palette.primary.main,
    flex: 'none',
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
                        <a href='https://docs.getunleash.io/concepts/feature-flags#feature-flag-lifecycle'>
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
    gap: theme.spacing(4),
}));

const FeedbackContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.neutral.light,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2.5),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const FeedbackButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 'normal',
    padding: 0,
    textDecoration: 'underline',
    verticalAlign: 'baseline',
}));

type Props = {
    open: boolean;
    onClose: () => void;
    onFollowLink: () => void;
};

export const ProjectStatusModal = ({ open, onClose, onFollowLink }: Props) => {
    const { openFeedback } = useFeedback('projectStatus', 'manual');
    const createFeedbackContext = () => {
        openFeedback({
            title: 'How easy was it to use the project status overview?',
            positiveLabel:
                'What do you like most about the project status overview?',
            areasForImprovementsLabel:
                'What should be improved on the project status overview?',
        });
    };
    const { isOss } = useUiConfig();

    return (
        <DynamicSidebarModal
            open={open}
            onClose={onClose}
            label='Project status'
            onClick={(e: React.SyntheticEvent) => {
                if (e.target instanceof HTMLAnchorElement) {
                    onFollowLink();
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
                        <ProjectHealthGrid />
                    </Row>
                    {!isOss() && (
                        <>
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
                        </>
                    )}
                </WidgetContainer>
                <CloseRow>
                    <FeedbackContainer>
                        <FeedbackIcon color='primary' />
                        <p>
                            Help us improve the project status overview; give us
                            your{' '}
                            <FeedbackButton
                                variant='text'
                                onClick={() => {
                                    createFeedbackContext();
                                    onClose();
                                }}
                                size='small'
                            >
                                feedback
                            </FeedbackButton>
                        </p>
                    </FeedbackContainer>
                    <Button variant='outlined' onClick={onClose}>
                        Close
                    </Button>
                </CloseRow>
            </ModalContentContainer>
        </DynamicSidebarModal>
    );
};
