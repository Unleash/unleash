import {
    Button,
    Dialog,
    IconButton,
    Typography,
    alpha,
    styled,
} from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type {
    ITutorialTopic,
    ITutorialTopicStep,
} from 'component/demo/demo-topics';
import type { TooltipRenderProps } from 'react-joyride';
import CloseIcon from '@mui/icons-material/Close';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusMedium,
        width: '100%',
        maxWidth: theme.spacing(45),
        padding: theme.spacing(3),
    },
}));

const StyledTooltip = styled('div')(({ theme }) => ({
    '@keyframes pulse': {
        '0%': {
            boxShadow: `0 0 0 0 ${alpha(theme.palette.spotlight.pulse, 1)}`,
        },
        '70%': {
            boxShadow: `0 0 0 16px ${alpha(theme.palette.spotlight.pulse, 0)}`,
        },
        '100%': {
            boxShadow: `0 0 0 0 ${alpha(theme.palette.spotlight.pulse, 0)}`,
        },
    },
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadiusMedium,
    width: '100%',
    maxWidth: theme.spacing(45),
    padding: theme.spacing(3),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.neutral.main,
}));

const StyledTooltipTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    flexWrap: 'wrap',
    paddingRight: theme.spacing(4),
}));

const StyledTooltipActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(3),
    '&&& button': {
        fontSize: theme.fontSizes.smallBody,
    },
}));

const StyledBackButton = styled(Button)({
    padding: 0,
    minWidth: 0,
});

// @ts-ignore
export interface IDemoStepTooltipProps extends TooltipRenderProps {
    step: ITutorialTopicStep;
    topic: number;
    topics: ITutorialTopic[];
    stepIndex: number;
    onClose: () => void;
    onBack: (step: ITutorialTopicStep) => void;
    onNext: (step: number) => void;
}

export const DemoStepTooltip = ({
    tooltipProps,
    step,
    topic,
    topics,
    stepIndex,
    onClose,
    onBack,
    onNext,
}: IDemoStepTooltipProps) => {
    const nextLabel =
        stepIndex === 0
            ? 'Start tutorial'
            : stepIndex === topics[topic].steps.length - 1
              ? 'Finish'
              : 'Next';

    if (step.target === 'body') {
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                }}
                {...tooltipProps}
            >
                <StyledDialog
                    open
                    onClose={(_, r) => {
                        if (r !== 'backdropClick') onClose();
                    }}
                    transitionDuration={0}
                    hideBackdrop
                >
                    <StyledCloseButton aria-label='close' onClick={onClose}>
                        <CloseIcon />
                    </StyledCloseButton>
                    <StyledTooltipTitle>
                        <Typography fontWeight='bold'>
                            {step.title || topics[topic].title}
                        </Typography>
                    </StyledTooltipTitle>
                    {step.content}
                    <StyledTooltipActions>
                        <div>
                            <ConditionallyRender
                                condition={
                                    !step.hideBackButton && stepIndex > 0
                                }
                                show={
                                    <StyledBackButton
                                        onClick={() => onBack(step)}
                                    >
                                        Back
                                    </StyledBackButton>
                                }
                            />
                        </div>
                        <div>
                            <ConditionallyRender
                                condition={Boolean(step.nextButton)}
                                show={
                                    <Button
                                        onClick={() => onNext(stepIndex)}
                                        variant='contained'
                                        sx={{ alignSelf: 'flex-end' }}
                                        data-testid='DEMO_NEXT_BUTTON'
                                    >
                                        {nextLabel}
                                    </Button>
                                }
                            />
                        </div>
                    </StyledTooltipActions>
                </StyledDialog>
            </div>
        );
    }

    return (
        <StyledTooltip
            onClick={(e) => {
                e.stopPropagation();
            }}
            {...tooltipProps}
        >
            <StyledCloseButton aria-label='close' onClick={onClose}>
                <CloseIcon />
            </StyledCloseButton>
            <StyledTooltipTitle>
                <Typography fontWeight='bold'>
                    {step.title || topics[topic].title}
                </Typography>
            </StyledTooltipTitle>
            {step.content}
            <StyledTooltipActions>
                <div>
                    <ConditionallyRender
                        condition={!step.hideBackButton && stepIndex > 0}
                        show={
                            <StyledBackButton onClick={() => onBack(step)}>
                                Back
                            </StyledBackButton>
                        }
                    />
                </div>
                <div>
                    <ConditionallyRender
                        condition={Boolean(step.nextButton)}
                        show={
                            <Button
                                onClick={() => onNext(stepIndex)}
                                variant='contained'
                                sx={{ alignSelf: 'flex-end' }}
                                data-testid='DEMO_NEXT_BUTTON'
                            >
                                {nextLabel}
                            </Button>
                        }
                    />
                </div>
            </StyledTooltipActions>
        </StyledTooltip>
    );
};
