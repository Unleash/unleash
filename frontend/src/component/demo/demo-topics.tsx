import { Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge } from 'component/common/Badge/Badge';
import { Step } from 'react-joyride';
import { gradualRollout, variants } from './demo-setup';

export interface ITutorialTopicStep extends Step {
    href?: string;
    nextButton?: boolean;
    backCloseModal?: boolean;
    backCollapseExpanded?: boolean;
    preventDefault?: boolean;
    anyClick?: boolean;
    optional?: boolean;
}

export interface ITutorialTopic {
    title: string;
    setup?: () => Promise<void>;
    steps: ITutorialTopicStep[];
}

export const TOPICS: ITutorialTopic[] = [
    {
        title: 'Enable/disable a feature toggle',
        steps: [
            {
                href: '/projects/default',
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            <a
                                href="https://docs.getunleash.io/reference/feature-toggles"
                                target="_blank"
                            >
                                Feature toggles
                            </a>{' '}
                            are the central concept of Unleash.
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Feature toggles are organized within{' '}
                            <a
                                href="https://docs.getunleash.io/reference/projects"
                                target="_blank"
                            >
                                projects
                            </a>
                            .
                        </Typography>
                    </>
                ),
                nextButton: true,
            },
            {
                href: '/projects/default',
                target: 'div[data-testid="TOGGLE-demoApp.step1-default"]',
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
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            <a
                                href="https://docs.getunleash.io/reference/activation-strategies"
                                target="_blank"
                            >
                                Activation strategies
                            </a>{' '}
                            give you more control over when a feature should be
                            enabled.
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Let's try enabling a feature toggle only for a
                            specific user.
                        </Typography>
                    </>
                ),
                nextButton: true,
            },
            {
                href: '/projects/default',
                target: 'a[href="/projects/default/features/demoApp.step2"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        First, let's open the feature toggle configuration for{' '}
                        <Badge as="span">demoApp.step2</Badge>.
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
                        Select the <Badge as="span">UserIDs</Badge> strategy
                        type.
                    </Typography>
                ),
                placement: 'right',
                backCloseModal: true,
            },
            {
                target: '#input-add-items',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Enter your <Badge as="span">userId</Badge>.
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            You can find your userId on the demo page.
                        </Badge>
                    </>
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
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            <a
                                href="https://docs.getunleash.io/reference/activation-strategies#gradual-rollout"
                                target="_blank"
                            >
                                Gradual rollout
                            </a>{' '}
                            is one of the available{' '}
                            <a
                                href="https://docs.getunleash.io/reference/activation-strategies"
                                target="_blank"
                            >
                                activation strategies
                            </a>
                            .
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Let's try enabling a feature toggle only for a
                            certain percentage of users.
                        </Typography>
                    </>
                ),
                nextButton: true,
            },
            {
                href: '/projects/default',
                target: 'a[href="/projects/default/features/demoApp.step3"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        First, let's open the feature toggle configuration for{' '}
                        <Badge as="span">demoApp.step3</Badge>.
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
                target: 'div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_default"].Mui-expanded a[data-testid="STRATEGY_EDIT-flexibleRollout"]',
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
        setup: variants,
        steps: [
            {
                href: '/projects/default',
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            <a
                                href="https://docs.getunleash.io/reference/feature-toggle-variants"
                                target="_blank"
                            >
                                Feature toggle variants
                            </a>{' '}
                            allow you to define different values for a feature
                            toggle. They can be used for A/B testing or
                            segmenting your users.
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Let's try adding a variant to a feature toggle,
                            along with an override so our user can see it.
                        </Typography>
                    </>
                ),
                nextButton: true,
            },
            {
                href: '/projects/default',
                target: 'a[href="/projects/default/features/demoApp.step4"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        First, let's open the feature toggle configuration for{' '}
                        <Badge as="span">demoApp.step4</Badge>.
                    </Typography>
                ),
                preventDefault: true,
            },
            {
                href: '/projects/default/features/demoApp.step4',
                target: 'button[data-testid="TAB-Variants"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Select the variants tab.
                    </Typography>
                ),
            },
            {
                target: 'button[data-testid="EDIT_VARIANTS_BUTTON"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Edit the existing variants.
                    </Typography>
                ),
            },
            {
                target: 'button[data-testid="MODAL_ADD_VARIANT_BUTTON"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Add a new variant to the list.
                    </Typography>
                ),
                backCloseModal: true,
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type div[data-testid="VARIANT_NAME_INPUT"]',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Enter a new variant name.
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            We recommend choosing a{' '}
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Web/CSS/named-color"
                                target="_blank"
                            >
                                color
                            </a>
                            .
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Example: <Badge as="span">aqua</Badge>.
                        </Typography>
                    </>
                ),
                backCloseModal: true,
                nextButton: true,
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type #variant-payload-value',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Enter the{' '}
                        <a
                            href="https://developer.mozilla.org/en-US/docs/Web/CSS/named-color"
                            target="_blank"
                        >
                            color
                        </a>{' '}
                        you chose on the previous step as the payload.
                    </Typography>
                ),
                nextButton: true,
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type button[data-testid="VARIANT_ADD_OVERRIDE_BUTTON"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Let's also add an override for our user.
                    </Typography>
                ),
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type #override-context-name',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Choose a context field.
                    </Typography>
                ),
                anyClick: true,
                backCloseModal: true,
            },
            {
                target: 'li[data-testid="SELECT_ITEM_ID-userId"]',
                content: (
                    <Typography variant="body2" color="text.secondary">
                        Select the <Badge as="span">userId</Badge> context
                        field.
                    </Typography>
                ),
                placement: 'right',
                backCloseModal: true,
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type div[data-testid="OVERRIDE_VALUES"]',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Enter your <Badge as="span">userId</Badge>.
                        </Typography>
                        <Badge
                            sx={{ marginTop: 2 }}
                            icon={<InfoOutlinedIcon />}
                        >
                            You can find your userId on the demo page.
                        </Badge>
                    </>
                ),
                nextButton: true,
                backCloseModal: true,
            },
            {
                target: 'button[data-testid="DIALOGUE_CONFIRM_ID"]',
                content: (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Save your variants to apply them.
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
        ],
    },
];
