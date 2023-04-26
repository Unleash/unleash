import { useEffect, useState } from 'react';
import { DemoTopics } from './DemoTopics/DemoTopics';
import { DemoSteps } from './DemoSteps/DemoSteps';
import { createLocalStorage } from 'utils/createLocalStorage';
import { TOPICS } from './demo-topics';
import { DemoDialogWelcome } from './DemoDialog/DemoDialogWelcome/DemoDialogWelcome';
import { DemoDialogFinish } from './DemoDialog/DemoDialogFinish/DemoDialogFinish';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { DemoDialogPlans } from './DemoDialog/DemoDialogPlans/DemoDialogPlans';

const defaultProgress = {
    welcomeOpen: true,
    expanded: true,
    topic: -1,
    steps: [0],
};

const { value: storedProgress, setValue: setStoredProgress } =
    createLocalStorage('Tutorial:v1', defaultProgress);

export const Demo = () => {
    const { uiConfig } = useUiConfig();

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
    const [steps, setSteps] = useState(
        storedProgress.steps ?? defaultProgress.steps
    );

    useEffect(() => {
        setStoredProgress({
            welcomeOpen,
            expanded,
            topic,
            steps,
        });
    }, [welcomeOpen, expanded, topic, steps]);

    const onStart = () => {
        setTopic(0);
        setSteps([0]);
        setExpanded(true);
    };

    const onFinish = () => {
        const completedSteps = steps.reduce(
            (acc, step) => acc + (step || 0),
            1
        );
        const totalSteps = TOPICS.flatMap(({ steps }) => steps).length;

        if (completedSteps === totalSteps) {
            setFinishOpen(true);
        }
    };

    if (!uiConfig.flags.demo) return null;

    return (
        <>
            <DemoDialogWelcome
                open={welcomeOpen}
                onClose={() => {
                    setWelcomeOpen(false);
                    setExpanded(false);
                }}
                onStart={() => {
                    setWelcomeOpen(false);
                    onStart();
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
                }}
            />
            <DemoDialogPlans
                open={plansOpen}
                onClose={() => setPlansOpen(false)}
            />
            <DemoTopics
                expanded={expanded}
                setExpanded={setExpanded}
                steps={steps}
                currentTopic={topic}
                setCurrentTopic={(topic: number) => {
                    setTopic(topic);
                    setSteps(steps => {
                        const newSteps = [...steps];
                        newSteps[topic] = 0;
                        return newSteps;
                    });
                }}
                topics={TOPICS}
                onWelcome={() => setWelcomeOpen(true)}
            />
            <DemoSteps
                setExpanded={setExpanded}
                steps={steps}
                setSteps={setSteps}
                topic={topic}
                setTopic={setTopic}
                topics={TOPICS}
                onFinish={onFinish}
            />
        </>
    );
};
