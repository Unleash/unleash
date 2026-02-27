import { useEffect, useState } from 'react';
import { DemoTopics } from './DemoTopics/DemoTopics.tsx';
import { DemoSteps } from './DemoSteps/DemoSteps.tsx';
import { createLocalStorage } from 'utils/createLocalStorage';
import { DEMO_PROJECT, TOPICS } from './demo-topics.js';
import { DemoDialogWelcome } from './DemoDialog/DemoDialogWelcome/DemoDialogWelcome.tsx';
import { DemoDialogFinish } from './DemoDialog/DemoDialogFinish/DemoDialogFinish.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { DemoBanner } from './DemoBanner/DemoBanner.tsx';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useMediaQuery } from '@mui/material';
import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { useNavigate } from 'react-router-dom';
import { DemoNotice } from './DemoNotice.tsx';

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
    const interactiveDemoKillSwitch = useUiFlag('interactiveDemoKillSwitch');
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down(768));
    const { trackEvent } = usePlausibleTracker();

    const { value: storedProgress, setValue: setStoredProgress } =
        createLocalStorage('Tutorial:v1.1', defaultProgress);

    const [welcomeOpen, setWelcomeOpen] = useState(
        storedProgress.welcomeOpen ?? defaultProgress.welcomeOpen,
    );
    const [finishOpen, setFinishOpen] = useState(false);

    const [expanded, setExpanded] = useState(
        storedProgress.expanded ?? defaultProgress.expanded,
    );
    const [topic, setTopic] = useState(
        storedProgress.topic ?? defaultProgress.topic,
    );
    const [step, setStep] = useState(
        storedProgress.step ?? defaultProgress.step,
    );
    const [stepsCompletion, setStepsCompletion] = useState(
        storedProgress.stepsCompletion ?? defaultProgress.stepsCompletion,
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

    const onWelcomeClose = () => {
        setWelcomeOpen(false);
        setExpanded(false);
        trackEvent('demo-close', {
            props: {
                topic: 'welcome',
                step: 'welcome',
            },
        });
    };

    const onWelcomeStart = () => {
        setWelcomeOpen(false);
        if (interactiveDemoKillSwitch) {
            navigate(`/projects/${DEMO_PROJECT}?sort=name`);
        } else {
            onStart();
        }
        trackEvent('demo-start');
    };

    if (!uiConfig.flags.demo) return children;

    return (
        <>
            <DemoBanner />
            {children}
            {interactiveDemoKillSwitch ? (
                <>
                    {welcomeOpen && (
                        <DemoDialogWelcome
                            open={welcomeOpen}
                            onClose={onWelcomeClose}
                            onStart={onWelcomeStart}
                        />
                    )}
                    <DemoNotice
                        onClick={() => {
                            setWelcomeOpen(true);
                            trackEvent('demo-view-demo-link');
                        }}
                    />
                </>
            ) : (
                <ConditionallyRender
                    condition={!isSmallScreen}
                    show={
                        <>
                            <DemoDialogWelcome
                                open={welcomeOpen}
                                onClose={onWelcomeClose}
                                onStart={onWelcomeStart}
                            />
                            <DemoDialogFinish
                                open={finishOpen}
                                onClose={() => {
                                    setFinishOpen(false);
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

                                    trackEvent('demo-start-topic', {
                                        props: {
                                            topic: TOPICS[topic].title,
                                        },
                                    });
                                }}
                                topics={TOPICS}
                                onWelcome={() => {
                                    closeGuide();

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
            )}
        </>
    );
};
