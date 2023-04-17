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

export interface ITutorialTopic {
    title: string;
    steps: Step[];
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
        title: 'Import',
        steps: [
            {
                target: 'button[data-testid="IMPORT_BUTTON"]',
                title: (
                    <Typography fontWeight="bold">
                        Import toggle configuration
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            This is a cool feature that enables you to import
                            your toggle configuration. This is just an example
                            and not part of the final guide.
                        </Typography>
                    </>
                ),
                disableBeacon: true,
            },
        ],
    },
    {
        title: 'New feature toggle',
        steps: [
            {
                target: 'button[data-testid="NAVIGATE_TO_CREATE_FEATURE"]',
                title: (
                    <Typography fontWeight="bold">
                        Add a new feature toggle
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            You can use this button to add a new feature toggle.
                            This is just an example and not part of the final
                            guide.
                        </Typography>
                    </>
                ),
                disableBeacon: true,
            },
        ],
    },
    {
        title: 'Enable/disable a feature toggle',
        steps: [
            {
                target: '.MuiSwitch-sizeMedium',
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
                disableBeacon: true,
            },
        ],
    },
    {
        title: 'Community',
        steps: [
            {
                target: 'a[href="https://twitter.com/getunleash"]',
                title: (
                    <Typography fontWeight="bold">
                        Follow us on Twitter!
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Following us on Twitter is one of the easiest ways
                            of keeping up with us. This is just an example and
                            not part of the final guide.
                        </Typography>
                    </>
                ),
                disableBeacon: true,
            },
            {
                target: 'a[href="https://www.linkedin.com/company/getunleash"]',
                title: (
                    <Typography fontWeight="bold">
                        Follow us on LinkedIn!
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            You can also follow us LinkedIn. This is just an
                            example and not part of the final guide.
                        </Typography>
                    </>
                ),
                disableBeacon: true,
            },
            {
                target: 'a[href="https://github.com/Unleash/unleash"]',
                title: (
                    <Typography fontWeight="bold">
                        Check out Unleash on GitHub!
                    </Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Unleash is open-source, check out the project on
                            GitHub. This is just an example and not part of the
                            final guide.
                        </Typography>
                    </>
                ),
                disableBeacon: true,
            },
            {
                target: 'a[href="https://slack.unleash.run"]',
                title: (
                    <Typography fontWeight="bold">Join us on Slack!</Typography>
                ),
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Join our community in Slack. This is just an example
                            and not part of the final guide.
                        </Typography>
                    </>
                ),
                disableBeacon: true,
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
