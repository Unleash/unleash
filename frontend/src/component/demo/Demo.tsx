import { Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge } from 'component/common/Badge/Badge';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useEffect, useState } from 'react';
import { Step } from 'react-joyride';
import { DemoTopics } from './DemoTopics/DemoTopics';
import { DemoSteps } from './DemoSteps/DemoSteps';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { createLocalStorage } from 'utils/createLocalStorage';

export interface ITutorialTopicStep extends Step {
    href?: string;
    nextButton?: boolean;
    backCloseModal?: boolean;
    preventDefault?: boolean;
    optional?: boolean;
}

export interface ITutorialTopic {
    title: string;
    steps: ITutorialTopicStep[];
}

const defaultProgress = {
    expanded: true,
    run: false,
    topic: 0,
    steps: [0],
};

const { value: storedProgress, setValue: setStoredProgress } =
    createLocalStorage('Tutorial:v1', defaultProgress);

const TOPICS: ITutorialTopic[] = [
    {
        title: 'Enable/disable a feature toggle',
        steps: [
            {
                href: '/projects/default',
                target: 'div[data-key="demoApp.step1-default"]',
                title: (
                    <Typography fontWeight="bold">
                        Enable/disable a feature toggle
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            The simplest way to use a feature toggle is to
                            enable or disable it for everyone (on/off).
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            Look at the demo page when toggling!
                        </Badge>
                    </>
                ),
                nextButton: true,
            },
        ],
    },
    {
        title: 'Enable for a specific user',
        steps: [
            {
                href: '/projects/default',
                target: 'a[href="/projects/default/features/demoApp.step2"]',
                title: (
                    <Typography fontWeight="bold">
                        Enable for a specific user
                    </Typography>
                ),
                content: (
                    <Typography variant="body2" color="text.secondary">
                        First, let's open the feature toggle configuration.
                    </Typography>
                ),
                preventDefault: true,
            },
            {
                href: '/projects/default/features/demoApp.step2',
                target: 'div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_default"] button',
                title: (
                    <Typography fontWeight="bold">
                        Enable for a specific user
                    </Typography>
                ),
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Add a new strategy to this environment by clicking this
                        button.
                    </Typography>
                ),
            },
            {
                target: 'a[href="/projects/default/features/demoApp.step2/strategies/create?environmentId=default&strategyName=userWithId"]',
                title: (
                    <Typography fontWeight="bold">
                        Enable for a specific user
                    </Typography>
                ),
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Select the UserIDs strategy type.
                    </Typography>
                ),
                backCloseModal: true,
            },
            {
                target: '#input-add-items',
                title: (
                    <Typography fontWeight="bold">
                        Enable for a specific user
                    </Typography>
                ),
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Enter the userID you see on the demo app.
                    </Typography>
                ),
                nextButton: true,
                backCloseModal: true,
            },
            {
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                title: (
                    <Typography fontWeight="bold">
                        Enable for a specific user
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Save your strategy to apply it.
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            Look at the demo page after saving!
                        </Badge>
                    </>
                ),
            },
            {
                target: 'button[data-testid="DIALOGUE_CONFIRM_ID"]',
                title: (
                    <Typography fontWeight="bold">
                        Enable for a specific user
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Confirm your changes.
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            Look at the demo page after saving!
                        </Badge>
                    </>
                ),
                optional: true,
            },
        ],
    },
    {
        title: 'Adjust gradual rollout',
        steps: [
            {
                href: '/projects/default',
                target: 'div[data-key="demoApp.step1-default"]',
                title: (
                    <Typography fontWeight="bold">
                        Adjust gradual rollout
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            The simplest way to use a feature toggle is to
                            enable or disable it for everyone (on/off).
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            Look at the demo page when toggling!
                        </Badge>
                    </>
                ),
                nextButton: true,
            },
        ],
    },
    {
        title: 'Adjust variants',
        steps: [
            {
                href: '/projects/default',
                target: 'div[data-key="demoApp.step1-default"]',
                title: (
                    <Typography fontWeight="bold">
                        Enable/disable a feature toggle
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            The simplest way to use a feature toggle is to
                            enable or disable it for everyone (on/off).
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            Look at the demo page when toggling!
                        </Badge>
                    </>
                ),
                nextButton: true,
            },
        ],
    },
];

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
