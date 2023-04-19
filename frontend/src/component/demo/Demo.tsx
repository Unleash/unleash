import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useEffect, useState } from 'react';
import { DemoTopics } from './DemoTopics/DemoTopics';
import { DemoSteps } from './DemoSteps/DemoSteps';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { createLocalStorage } from 'utils/createLocalStorage';
import { TOPICS } from './demo-topics';

const defaultProgress = {
    expanded: true,
    run: false,
    topic: 0,
    steps: [0],
};

const { value: storedProgress, setValue: setStoredProgress } =
    createLocalStorage('Tutorial:v1', defaultProgress);

export const Demo = () => {
    const { uiConfig } = useUiConfig();
    const [loaded, setLoaded] = useState(false);
    const [expanded, setExpanded] = useState(storedProgress.expanded ?? true);
    const [run, setRun] = useState(storedProgress.run ?? false);
    const [topic, setTopic] = useState(storedProgress.topic ?? 0);
    const [steps, setSteps] = useState(storedProgress.steps ?? [0]);

    useEffect(() => {
        setTimeout(() => {
            setLoaded(true);
        }, 1000);
    }, []);

    useEffect(() => {
        setStoredProgress({
            expanded,
            run,
            topic,
            steps,
        });
    }, [expanded, run, topic, steps]);

    if (!uiConfig.flags.demo) return null;

    return (
        <>
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
            />
            <ConditionallyRender
                condition={loaded}
                show={
                    <DemoSteps
                        run={run}
                        setRun={setRun}
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
