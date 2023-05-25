import { useEffect, useState } from 'react';
import { DemoTopics } from './DemoTopics/DemoTopics';
import { DemoSteps } from './DemoSteps/DemoSteps';
import { createLocalStorage } from 'utils/createLocalStorage';
import { TOPICS } from './demo-topics';
import { DemoDialogWelcome } from './DemoDialog/DemoDialogWelcome/DemoDialogWelcome';
import { DemoDialogFinish } from './DemoDialog/DemoDialogFinish/DemoDialogFinish';
import { DemoDialogPlans } from './DemoDialog/DemoDialogPlans/DemoDialogPlans';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { DemoBanner } from './DemoBanner/DemoBanner';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useMediaQuery } from '@mui/material';
import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const defaultProgress = {
    welcomeOpen: true,
    expanded: true,
    topic: -1,
    step: 0,
    stepsCompletion: Array(TOPICS.length).fill(0),
};

interface IDemoProps {
    children: JSX.Element;
}

export const Demo = ({ children }: IDemoProps): JSX.Element => {
    const { uiConfig } = useUiConfig();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down(768));
    const { trackEvent } = usePlausibleTracker();

    const { value: storedProgress, setValue: setStoredProgress } =
        createLocalStorage('Tutorial:v1.1', defaultProgress);

    const [welcomeOpen, setWelcomeOpen] = useState(
        storedProgress.welcomeOpen ?? defaultProgress.welcomeOpen
    );
    const [finishOpen, setFinishOpen] = useState(false);
    const [plansOpen, setPlansOpen] = useState(false);

    const [expanded, setExpanded] = useState(
        storedProgress.expanded ?? defaultProgress.expanded
    );
    const [topic, setTopic] = useState(
        storedProgress.topic ?? defaultProgress.topic
    );
    const [step, setStep] = useState(
        storedProgress.step ?? defaultProgress.step
    );
    const [stepsCompletion, setStepsCompletion] = useState(
        storedProgress.stepsCompletion ?? defaultProgress.stepsCompletion
    );

    useEffect(() => {
        setStoredProgress({
            welcomeOpen,
            expanded,
            topic,
            step,
            stepsCompletion,
        });
    }, [welcomeOpen, expanded, topic, step, stepsCompletion]);

    const onStart = () => {
        setTopic(0);
        setStep(0);
        setStepsCompletion(Array(TOPICS.length).fill(0));
        setExpanded(true);
    };

    const onFinish = () => {
        setFinishOpen(true);

        trackEvent('demo-finish');
    };

    const closeGuide = () => {
        setTopic(-1);
        setStep(0);
    };

    if (!uiConfig.flags.demo) return children;

    return (
        <>
            <DemoBanner
                onPlans={() => {
                    closeGuide();
                    setWelcomeOpen(false);

                    setPlansOpen(true);

                    trackEvent('demo-see-plans');
                }}
            />
            {children}
            <DemoDialogPlans
                open={plansOpen}
                onClose={() => setPlansOpen(false)}
            />
            <ConditionallyRender
                condition={!isSmallScreen}
                show={
                    <>
                        <DemoDialogWelcome
                            open={welcomeOpen}
                            onClose={() => {
                                setWelcomeOpen(false);

                                setExpanded(false);

                                trackEvent('demo-close', {
                                    props: {
                                        topic: 'welcome',
                                        step: 'welcome',
                                    },
                                });
                            }}
                            onStart={() => {
                                setWelcomeOpen(false);

                                onStart();

                                trackEvent('demo-start');
                            }}
                        />
                        <DemoDialogFinish
                            open={finishOpen}
                            onClose={() => {
                                setFinishOpen(false);
                                setPlansOpen(true);
                            }}
                            onRestart={() => {
                                setFinishOpen(false);
                                onStart();

                                trackEvent('demo-restart');
                            }}
                        />
                        <DemoTopics
                            expanded={expanded}
                            setExpanded={setExpanded}
                            stepsCompletion={stepsCompletion}
                            currentTopic={topic}
                            setCurrentTopic={(topic: number) => {
                                setTopic(topic);
                                setStep(0);

                                setWelcomeOpen(false);
                                setPlansOpen(false);

                                trackEvent('demo-start-topic', {
                                    props: {
                                        topic: TOPICS[topic].title,
                                    },
                                });
                            }}
                            topics={TOPICS}
                            onWelcome={() => {
                                closeGuide();
                                setPlansOpen(false);

                                setWelcomeOpen(true);

                                trackEvent('demo-view-demo-link');
                            }}
                        />
                        <DemoSteps
                            setExpanded={setExpanded}
                            step={step}
                            setStep={setStep}
                            stepsCompletion={stepsCompletion}
                            setStepsCompletion={setStepsCompletion}
                            topic={topic}
                            setTopic={setTopic}
                            topics={TOPICS}
                            onFinish={onFinish}
                        />
                    </>
                }
            />
        </>
    );
};
