import Joyride, {
    ACTIONS,
    CallBackProps,
    EVENTS,
    STATUS,
    TooltipRenderProps,
} from 'react-joyride';
import { Button, styled, useTheme } from '@mui/material';
import { ITutorialTopic } from '../Demo';
import { useEffect } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledTooltip = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadiusMedium,
    width: '100%',
    maxWidth: theme.spacing(45),
    padding: theme.spacing(3),
}));

const StyledTooltipTitle = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledTooltipActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
    '&&& button': {
        '&:first-of-type': {
            marginLeft: theme.spacing(-2),
        },
        fontSize: theme.fontSizes.smallBody,
    },
}));

const StyledTooltipPrimaryActions = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

interface IDemoStepsProps {
    run: boolean;
    setRun: React.Dispatch<React.SetStateAction<boolean>>;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    steps: number[];
    setSteps: React.Dispatch<React.SetStateAction<number[]>>;
    topic: number;
    setTopic: React.Dispatch<React.SetStateAction<number>>;
    topics: ITutorialTopic[];
}

export const DemoSteps = ({
    run,
    setRun,
    setExpanded,
    steps,
    setSteps,
    topic,
    setTopic,
    topics,
}: IDemoStepsProps) => {
    const theme = useTheme();

    const skip = () => {
        setRun(false);
        setTopic(-1);
        setExpanded(false);
    };

    const back = () => {
        if (steps[topic] === 0) {
            setRun(false);
            const newTopic = topic - 1;
            setTopic(newTopic);
            setSteps(steps => {
                const newSteps = [...steps];
                newSteps[newTopic] = topics[newTopic].steps.length - 1;
                return newSteps;
            });
        } else {
            setSteps(steps => {
                const newSteps = [...steps];
                newSteps[topic] = steps[topic] - 1;
                return newSteps;
            });
        }
    };

    const joyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type, step } = data;

        if (action === ACTIONS.UPDATE) {
            const el = document.querySelector(step.target as string);
            if (el) {
                el.scrollIntoView({
                    block: 'center',
                });
            }
        }

        if (
            ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(
                type
            )
        ) {
            const newStep = index + (action === ACTIONS.PREV ? -1 : 1);
            setSteps(steps => {
                const newSteps = [...steps];
                newSteps[topic] = newStep;
                return newSteps;
            });
        } else if (
            ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)
        ) {
            setRun(false);
            if (topic === topics.length - 1) {
                setTopic(-1);
                setExpanded(false);
            } else {
                const newTopic = topic + 1;
                setTopic(newTopic);
                setSteps(steps => {
                    const newSteps = [...steps];
                    newSteps[newTopic] = 0;
                    return newSteps;
                });
            }
        }
    };

    useEffect(() => {
        setRun(true);
    }, [topic, steps]);

    if (topic === -1) return null;

    return (
        <Joyride
            run={run}
            stepIndex={steps[topic]}
            callback={joyrideCallback}
            steps={topics[topic].steps}
            disableScrollParentFix
            disableScrolling
            disableOverlayClose
            spotlightClicks
            floaterProps={{
                disableAnimation: true,
                styles: {
                    floater: {
                        filter: `drop-shadow(${theme.palette.primary.main} 0px 0px 3px)`,
                    },
                },
            }}
            styles={{
                options: {
                    arrowColor: theme.palette.background.paper,
                    zIndex: theme.zIndex.snackbar,
                },
                spotlight: {
                    borderRadius: theme.shape.borderRadiusMedium,
                    border: `2px solid ${theme.palette.primary.main}`,
                    outline: `2px solid ${theme.palette.secondary.border}`,
                    backgroundColor: 'transparent',
                },
                overlay: {
                    backgroundColor: 'transparent',
                    mixBlendMode: 'unset',
                },
            }}
            tooltipComponent={({
                step,
                primaryProps,
                tooltipProps,
            }: TooltipRenderProps) => {
                const { onClick } = primaryProps;

                return (
                    <StyledTooltip {...tooltipProps}>
                        <StyledTooltipTitle>{step.title}</StyledTooltipTitle>
                        {step.content}
                        <StyledTooltipActions>
                            <Button variant="text" onClick={skip}>
                                Skip
                            </Button>
                            <StyledTooltipPrimaryActions>
                                <ConditionallyRender
                                    condition={topic > 0 || steps[topic] > 0}
                                    show={
                                        <Button
                                            variant="outlined"
                                            onClick={back}
                                        >
                                            Back
                                        </Button>
                                    }
                                />
                                <Button onClick={onClick} variant="contained">
                                    {topic === topics.length - 1 &&
                                    steps[topic] ===
                                        topics[topic].steps.length - 1
                                        ? 'Finish'
                                        : 'Next'}
                                </Button>
                            </StyledTooltipPrimaryActions>
                        </StyledTooltipActions>
                    </StyledTooltip>
                );
            }}
        />
    );
};
