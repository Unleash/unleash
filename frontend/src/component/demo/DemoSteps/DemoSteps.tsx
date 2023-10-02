import Joyride, {
    ACTIONS,
    CallBackProps,
    TooltipRenderProps,
} from 'react-joyride';
import { useTheme } from '@mui/material';
import { ITutorialTopic, ITutorialTopicStep } from '../demo-topics';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DemoStepTooltip } from './DemoStepTooltip/DemoStepTooltip';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

interface IDemoStepsProps {
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    step: number;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    stepsCompletion: number[];
    setStepsCompletion: React.Dispatch<React.SetStateAction<number[]>>;
    topic: number;
    setTopic: React.Dispatch<React.SetStateAction<number>>;
    topics: ITutorialTopic[];
    onFinish: () => void;
}

export const DemoSteps = ({
    setExpanded,
    step,
    setStep,
    stepsCompletion,
    setStepsCompletion,
    topic,
    setTopic,
    topics,
    onFinish,
}: IDemoStepsProps) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { trackEvent } = usePlausibleTracker();
    const [run, setRun] = useState(false);
    const [flow, setFlow] = useState<'next' | 'back' | 'load'>('load');

    const abortController = new AbortController();

    const setTopicStep = (topic: number, step?: number) => {
        setRun(false);
        if (step !== undefined) {
            if (stepsCompletion[topic] < step) {
                setStepsCompletion(steps => {
                    const newSteps = [...steps];
                    newSteps[topic] = step;
                    return newSteps;
                });
            }
            setStep(step);
        }
        setTopic(topic);
    };

    const close = () => {
        abortController.abort();
        setTopicStep(-1);

        trackEvent('demo-close', {
            props: {
                topic: topics[topic].title,
                step: step + 1,
            },
        });
    };

    const back = () => {
        setFlow('back');
        if (step === 0) {
            const newTopic = topic - 1;
            setTopicStep(newTopic, topics[newTopic].steps.length - 1);
        } else {
            setTopicStep(topic, step - 1);
        }
    };

    const nextTopic = () => {
        const currentTopic = topic;

        const nextUnfinishedTopic =
            topics.findIndex(
                (topic, index) =>
                    index !== currentTopic &&
                    stepsCompletion[index] < topic.steps.length
            ) ?? -1;

        if (nextUnfinishedTopic === -1) {
            setTopicStep(-1);
            setExpanded(false);
            onFinish();
        } else {
            setTopicStep(nextUnfinishedTopic, 0);
        }
    };

    const next = (index = step) => {
        setFlow('next');
        setTopicStep(topic, index + 1);
        if (index === topics[topic].steps.length - 1) {
            nextTopic();
        }
    };

    const joyrideCallback = (
        data: CallBackProps & {
            step: ITutorialTopicStep;
        }
    ) => {
        const { action, index, step } = data;

        if (action === ACTIONS.CLOSE) {
            close();
        }

        if (action === ACTIONS.UPDATE) {
            const el = document.querySelector(
                step.target as string
            ) as HTMLElement | null;
            if (el) {
                el.scrollIntoView({
                    block: 'center',
                });

                if (step.focus) {
                    if (step.focus === true) {
                        el.focus();
                    } else {
                        const focusEl = el.querySelector(
                            step.focus
                        ) as HTMLElement | null;
                        focusEl?.focus();
                    }
                }

                if (!step.nextButton) {
                    const clickHandler = (e: Event) => {
                        abortController.abort();
                        next(index);
                        if (step.preventDefault) {
                            e.preventDefault();
                        }
                    };

                    if (step.anyClick) {
                        window.addEventListener(
                            'click',
                            e => {
                                const targetEl = e.target as HTMLElement;
                                if (
                                    !targetEl.closest('.__floater') &&
                                    !targetEl.className.includes(
                                        'react-joyride__overlay'
                                    )
                                )
                                    clickHandler(e);
                            },
                            {
                                signal: abortController.signal,
                            }
                        );
                    } else {
                        el.addEventListener('click', clickHandler, {
                            signal: abortController.signal,
                        });
                    }
                }
            }
        }
    };

    const onBack = (step: ITutorialTopicStep) => {
        if (step.backCloseModal) {
            (
                document.querySelector('.MuiModal-backdrop') as HTMLElement
            )?.click();
        }
        if (step.backCollapseExpanded) {
            (
                document.querySelector(
                    '.Mui-expanded[role="button"]'
                ) as HTMLElement
            )?.click();
        }
        back();
    };

    const waitForLoad = (step: ITutorialTopicStep, tries = 0) => {
        setTimeout(() => {
            if (document.querySelector(step.target as string)) {
                setRun(true);
            } else {
                if (flow === 'next' && step.optional) {
                    next();
                } else if (flow === 'back' || tries > 4) {
                    back();
                } else {
                    waitForLoad(step, tries + 1);
                }
            }
        }, 300);
    };

    useEffect(() => {
        if (topic === -1) return;
        const currentTopic = topics[topic];
        const currentStep = currentTopic.steps[step];
        if (!currentStep) return;

        setTimeout(() => {
            if (
                currentStep.href &&
                !location.pathname.endsWith(currentStep.href.split('?')[0])
            ) {
                navigate(currentStep.href);
            }
            waitForLoad(currentStep);
        }, currentStep.delay ?? 0);
    }, [topic, step]);

    useEffect(() => {
        if (topic > -1) topics[topic].setup?.();
    }, [topic]);

    if (topic === -1) return null;

    const joyrideSteps = topics[topic].steps.map(step => ({
        ...step,
        disableBeacon: true,
    }));

    return (
        <Joyride
            run={run}
            stepIndex={step}
            callback={joyrideCallback}
            steps={joyrideSteps}
            disableScrolling
            disableOverlayClose
            spotlightClicks
            spotlightPadding={0}
            floaterProps={{
                disableAnimation: true,
                styles: {
                    floater: {
                        filter: `drop-shadow(rgba(32, 32, 33, .2) 0px 4px 12px)`,
                    },
                },
            }}
            styles={{
                options: {
                    arrowColor: theme.palette.background.paper,
                    zIndex: theme.zIndex.snackbar - 1,
                },
                spotlight: {
                    borderRadius: theme.shape.borderRadiusMedium,
                    border: `2px solid ${theme.palette.spotlight.border}`,
                    outline: `2px solid ${theme.palette.spotlight.outline}`,
                    animation: 'pulse 2s infinite',
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                },
            }}
            tooltipComponent={(
                props: TooltipRenderProps & {
                    step: ITutorialTopicStep;
                }
            ) => (
                <DemoStepTooltip
                    {...props}
                    topic={topic}
                    topics={topics}
                    stepIndex={step}
                    onClose={close}
                    onBack={onBack}
                    onNext={next}
                />
            )}
        />
    );
};
