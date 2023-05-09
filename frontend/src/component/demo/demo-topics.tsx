import { Typography, TypographyProps } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge } from 'component/common/Badge/Badge';
import { Step } from 'react-joyride';
import { gradualRollout, variants } from './demo-setup';
import { basePath } from 'utils/formatPath';

export interface ITutorialTopicStep extends Step {
    href?: string;
    nextButton?: boolean;
    backCloseModal?: boolean;
    backCollapseExpanded?: boolean;
    preventDefault?: boolean;
    anyClick?: boolean;
    optional?: boolean;
    focus?: boolean | string;
    delay?: number;
}

export interface ITutorialTopic {
    title: string;
    setup?: () => Promise<void>;
    steps: ITutorialTopicStep[];
}

const Description = (props: TypographyProps) => (
    <Typography variant="body2" color="text.secondary" {...props} />
);

const PROJECT = 'demo-app';
const ENVIRONMENT = 'dev';

export const TOPICS: ITutorialTopic[] = [
    {
        title: 'Enable/disable a feature toggle',
        steps: [
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href="https://docs.getunleash.io/reference/feature-toggles"
                                target="_blank"
                            >
                                Feature toggles
                            </a>{' '}
                            are the central concept of Unleash.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Feature toggles are organized within{' '}
                            <a
                                href="https://docs.getunleash.io/reference/projects"
                                target="_blank"
                            >
                                projects
                            </a>
                            .
                        </Description>
                    </>
                ),
                nextButton: true,
            },
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step1-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            The simplest way to use a feature toggle is to
                            enable or disable it for everyone (on/off).
                        </Description>
                        <Badge sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
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
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href="https://docs.getunleash.io/reference/activation-strategies"
                                target="_blank"
                            >
                                Activation strategies
                            </a>{' '}
                            give you more control over when a feature should be
                            enabled.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Let's try enabling a feature toggle only for a
                            specific user.
                        </Description>
                    </>
                ),
                nextButton: true,
            },
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: `a[href="${basePath}/projects/${PROJECT}/features/demoApp.step2"]`,
                content: (
                    <Description>
                        First, let's open the feature toggle configuration for{' '}
                        <Badge as="span">demoApp.step2</Badge>
                    </Description>
                ),
                preventDefault: true,
            },
            {
                href: `/projects/${PROJECT}/features/demoApp.step2`,
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] button`,
                content: (
                    <Description>
                        Add a new strategy to this environment by clicking this
                        button.
                    </Description>
                ),
            },
            {
                target: `a[href="${basePath}/projects/${PROJECT}/features/demoApp.step2/strategies/create?environmentId=${ENVIRONMENT}&strategyName=default"]`,
                content: (
                    <Description>
                        Select the <Badge as="span">Standard</Badge> strategy
                        type.
                    </Description>
                ),
                placement: 'right',
                backCloseModal: true,
            },
            {
                target: 'button[data-testid="ADD_CONSTRAINT_BUTTON"]',
                content: (
                    <>
                        <Description>
                            <a
                                href="https://docs.getunleash.io/reference/strategy-constraints"
                                target="_blank"
                            >
                                Strategy constraints
                            </a>{' '}
                            are conditions that must be satisfied for an{' '}
                            <a
                                href="https://docs.getunleash.io/reference/activation-strategies"
                                target="_blank"
                            >
                                activation strategy
                            </a>{' '}
                            to be evaluated for a feature toggle.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Click this button to add a constraint.
                        </Description>
                    </>
                ),
                backCloseModal: true,
            },
            {
                target: '#context-field-select',
                content: (
                    <Description>
                        <a
                            href="https://docs.getunleash.io/reference/unleash-context"
                            target="_blank"
                        >
                            Unleash context
                        </a>{' '}
                        contains information relating to the current feature
                        toggle request.
                    </Description>
                ),
                backCloseModal: true,
                anyClick: true,
            },
            {
                target: 'li[data-testid="SELECT_ITEM_ID-userId"]',
                content: (
                    <Description>
                        Select the <Badge as="span">userId</Badge> context
                        field.
                    </Description>
                ),
                placement: 'right',
                backCloseModal: true,
            },
            {
                target: 'div[data-testid="CONSTRAINT_VALUES_INPUT"]',
                content: (
                    <>
                        <Description>
                            Enter your <Badge as="span">userId</Badge>
                        </Description>
                        <Badge sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
                            You can find your userId on the demo page.
                        </Badge>
                    </>
                ),
                nextButton: true,
                focus: 'input',
            },
            {
                target: 'button[data-testid="CONSTRAINT_VALUES_ADD_BUTTON"]',
                content: <Description>Add the constraint value.</Description>,
            },
            {
                target: 'button[data-testid="CONSTRAINT_SAVE_BUTTON"]',
                content: <Description>Save the constraint.</Description>,
            },
            {
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                content: <Description>Save your strategy.</Description>,
                backCloseModal: true,
            },
            {
                target: 'button[data-testid="DIALOGUE_CONFIRM_ID"]',
                content: <Description>Confirm your changes.</Description>,
                optional: true,
                backCloseModal: true,
            },
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step2-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Finally, toggle{' '}
                            <Badge as="span">demoApp.step2</Badge>
                        </Description>
                        <Badge sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
                            Look at the demo page to see your changes!
                        </Badge>
                    </>
                ),
                nextButton: true,
                delay: 500,
            },
        ],
    },
    {
        title: 'Adjust gradual rollout',
        setup: gradualRollout,
        steps: [
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
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
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Let's try enabling a feature toggle only for a
                            certain percentage of users.
                        </Description>
                    </>
                ),
                nextButton: true,
            },
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: `a[href="${basePath}/projects/${PROJECT}/features/demoApp.step3"]`,
                content: (
                    <Description>
                        First, open the feature toggle configuration for{' '}
                        <Badge as="span">demoApp.step3</Badge> by using this
                        link.
                    </Description>
                ),
                preventDefault: true,
            },
            {
                href: `/projects/${PROJECT}/features/demoApp.step3`,
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] .MuiAccordionSummary-expandIconWrapper`,
                content: (
                    <Description>
                        Expand the environment card to see all the defined
                        strategies by using the arrow button.
                    </Description>
                ),
            },
            {
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"].Mui-expanded a[data-testid="STRATEGY_EDIT-flexibleRollout"]`,
                content: (
                    <Description>
                        Edit the existing gradual rollout strategy by using the
                        "Edit" button.
                    </Description>
                ),
                backCollapseExpanded: true,
            },
            {
                target: 'span[data-testid="ROLLOUT_SLIDER_ID"]',
                content: (
                    <>
                        <Description>
                            Change the rollout percentage by adjusting the
                            percentage slider.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            When you're done, use the "Next" button in the
                            dialog.
                        </Description>
                    </>
                ),
                backCloseModal: true,
                nextButton: true,
            },
            {
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                content: (
                    <Description>
                        Save and apply your strategy by using this button.
                    </Description>
                ),
            },
            {
                target: 'button[data-testid="DIALOGUE_CONFIRM_ID"]',
                content: (
                    <Description>
                        Confirm your changes by using this button.
                    </Description>
                ),
                optional: true,
                backCloseModal: true,
            },
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step3-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Finally, enable or disable the feature with the new
                            variant by toggling the highlighted switch.
                        </Description>
                        <Badge sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
                            Look at the demo page to see your changes!
                        </Badge>
                    </>
                ),
                nextButton: true,
                delay: 500,
            },
        ],
    },
    {
        title: 'Adjust variants',
        setup: variants,
        steps: [
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href="https://docs.getunleash.io/reference/feature-toggle-variants"
                                target="_blank"
                            >
                                Feature toggle variants
                            </a>{' '}
                            allow you to define different values for a feature
                            toggle. They can be used for A/B testing or
                            segmenting your users.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Let's try adding a variant to a feature toggle,
                            along with an override so our user can see it.
                        </Description>
                    </>
                ),
                nextButton: true,
            },
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: `a[href="${basePath}/projects/${PROJECT}/features/demoApp.step4"]`,
                content: (
                    <Description>
                        First, open the feature toggle configuration for{' '}
                        <Badge as="span">demoApp.step4</Badge> by using this
                        link.
                    </Description>
                ),
                preventDefault: true,
            },
            {
                href: `/projects/${PROJECT}/features/demoApp.step4`,
                target: 'button[data-testid="TAB-Variants"]',
                content: <Description>Select the "Variants" tab.</Description>,
            },
            {
                target: 'button[data-testid="EDIT_VARIANTS_BUTTON"]',
                content: (
                    <Description>
                        Edit the existing variants by using this button.
                    </Description>
                ),
            },
            {
                target: 'button[data-testid="MODAL_ADD_VARIANT_BUTTON"]',
                content: (
                    <Description>
                        Add a new variant to the list by using this button.
                    </Description>
                ),
                backCloseModal: true,
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type div[data-testid="VARIANT_NAME_INPUT"]',
                content: (
                    <>
                        <Description>
                            Enter a unique name for your variant.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            When you're done, use the "Next" button in the
                            dialog.
                        </Description>
                    </>
                ),
                backCloseModal: true,
                nextButton: true,
                focus: 'input',
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type #variant-payload-value',
                content: (
                    <>
                        <Description>
                            Enter a{' '}
                            <a
                                href="https://developer.mozilla.org/en-US/docs/Web/CSS/named-color"
                                target="_blank"
                            >
                                color
                            </a>{' '}
                            as the payload. It will be passed along and used in
                            the demo website.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            It can be any color. For example, you can use one of
                            these: <Badge as="span">teal</Badge>,{' '}
                            <Badge as="span">orange</Badge> or{' '}
                            <Badge as="span">purple</Badge>
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            When you're done, use the "Next" button in the
                            dialog.
                        </Description>
                    </>
                ),
                nextButton: true,
                focus: true,
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type button[data-testid="VARIANT_ADD_OVERRIDE_BUTTON"]',
                content: (
                    <>
                        <Description>
                            By adding an override, we can specify that your user
                            will always get this variant.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Let's add an override for your user by using this
                            button.
                        </Description>
                    </>
                ),
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type #override-context-name',
                content: (
                    <Description>
                        Select the context field by using this dropdown.
                    </Description>
                ),
                anyClick: true,
                backCloseModal: true,
            },
            {
                target: 'li[data-testid="SELECT_ITEM_ID-userId"]',
                content: (
                    <Description>
                        Select the <Badge as="span">userId</Badge> context
                        field.
                    </Description>
                ),
                placement: 'right',
                backCloseModal: true,
            },
            {
                target: 'div[data-testid="VARIANT"]:last-of-type div[data-testid="OVERRIDE_VALUES"]',
                content: (
                    <>
                        <Description>
                            Enter your <Badge as="span">userId</Badge>
                        </Description>
                        <Badge sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
                            You can find your userId on the demo page.
                        </Badge>
                        <Description sx={{ mt: 1 }}>
                            When you're done, use the "Next" button in the
                            dialog.
                        </Description>
                    </>
                ),
                nextButton: true,
                backCloseModal: true,
                focus: 'input',
            },
            {
                target: 'button[data-testid="DIALOGUE_CONFIRM_ID"]',
                content: (
                    <Description>
                        Save your variants by using this button.
                    </Description>
                ),
            },
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step4-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Finally, enable or disable the feature with the new
                            variant by toggling the highlighted switch.
                        </Description>
                        <Badge sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
                            Look at the demo page to see your changes!
                        </Badge>
                    </>
                ),
                nextButton: true,
                delay: 500,
            },
        ],
    },
];
