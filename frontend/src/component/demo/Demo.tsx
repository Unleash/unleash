import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useEffect, useState } from 'react';
import { DemoTopics } from './DemoTopics/DemoTopics';
import { DemoSteps } from './DemoSteps/DemoSteps';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { createLocalStorage } from 'utils/createLocalStorage';
import { TOPICS } from './demo-topics';
import { DemoWelcomeDialog } from './DemoWelcomeDialog/DemoWelcomeDialog';

const defaultProgress = {
    welcomeOpen: true,
    expanded: true,
    active: false,
    topic: 0,
    steps: [0],
};

const { value: storedProgress, setValue: setStoredProgress } =
    createLocalStorage('Tutorial:v1', defaultProgress);

export const Demo = () => {
    const { uiConfig } = useUiConfig();
    const [welcomeOpen, setWelcomeOpen] = useState(
        storedProgress.welcomeOpen ?? true
    );
    const [active, setActive] = useState(false);
    const [expanded, setExpanded] = useState(storedProgress.expanded ?? true);
    const [topic, setTopic] = useState(storedProgress.topic ?? 0);
    const [steps, setSteps] = useState(storedProgress.steps ?? [0]);

    useEffect(() => {
        if (storedProgress.active) {
            setTimeout(() => {
                setActive(true);
            }, 1000);
        }
    }, []);

    useEffect(() => {
        setStoredProgress({
            welcomeOpen,
            expanded,
            active,
            topic,
            steps,
        });
    }, [welcomeOpen, expanded, active, topic, steps]);

    if (!uiConfig.flags.demo) return null;

    return (
        <>
            <DemoWelcomeDialog
                open={welcomeOpen}
                onClose={() => {
                    setWelcomeOpen(false);
                    setExpanded(false);
                }}
                onStart={() => {
                    setWelcomeOpen(false);
                    setActive(true);
                }}
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
                showWelcome={() => setWelcomeOpen(true)}
            />
            <ConditionallyRender
                condition={active}
                show={
                    <DemoSteps
                        setExpanded={setExpanded}
                        steps={steps}
                        setSteps={setSteps}
                        topic={topic}
                        setTopic={setTopic}
                        topics={TOPICS}
                    />
                }
            />
        </>
    );
};
