import { Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge } from 'component/common/Badge/Badge';
import { Step } from 'react-joyride';
import { gradualRollout } from './demo-setup';

export interface ITutorialTopicStep extends Step {
    href?: string;
    nextButton?: boolean;
    backCloseModal?: boolean;
    backCollapseExpanded?: boolean;
    preventDefault?: boolean;
    optional?: boolean;
}

export interface ITutorialTopic {
    title: string;
    setup?: () => void;
    steps: ITutorialTopicStep[];
}

export const TOPICS: ITutorialTopic[] = [
    {
        title: 'Enable/disable a feature toggle',
        steps: [
            {
                href: '/projects/default',
                target: 'div[data-key="demoApp.step1-default"]',
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
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Add a new strategy to this environment by clicking this
                        button.
                    </Typography>
                ),
            },
            {
                target: 'a[href="/projects/default/features/demoApp.step2/strategies/create?environmentId=default&strategyName=userWithId"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Select the UserIDs strategy type.
                    </Typography>
                ),
                backCloseModal: true,
            },
            {
                target: '#input-add-items',
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
        setup: gradualRollout,
        steps: [
            {
                href: '/projects/default',
                target: 'a[href="/projects/default/features/demoApp.step3"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        First, let's open the feature toggle configuration.
                    </Typography>
                ),
                preventDefault: true,
            },
            {
                href: '/projects/default/features/demoApp.step3',
                target: 'div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_default"] .MuiAccordionSummary-expandIconWrapper',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Expand the environment card to see all the defined
                        strategies.
                    </Typography>
                ),
            },
            {
                target: 'div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_default"].Mui-expanded a[data-edit-strategy="flexibleRollout"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Edit the existing gradual rollout strategy.
                    </Typography>
                ),
                backCollapseExpanded: true,
            },
            {
                target: 'span[data-testid="ROLLOUT_SLIDER_ID"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Change the rollout percentage.
                    </Typography>
                ),
                backCloseModal: true,
            },
            {
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
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
        title: 'Adjust variants',
        steps: [
            {
                href: '/projects/default',
                target: 'div[data-key="demoApp.step1-default"]',
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
