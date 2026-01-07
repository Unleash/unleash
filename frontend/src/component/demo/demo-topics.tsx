import { Typography, type TypographyProps, styled } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge } from 'component/common/Badge/Badge';
import type { Step } from 'react-joyride';
import { specificUser, gradualRollout, variants } from './demo-setup.ts';
import { basePath, formatAssetPath } from 'utils/formatPath';
import demoUserId from 'assets/img/demo-userid.png';

export interface ITutorialTopicStep extends Step {
    href?: string;
    nextButton?: boolean;
    backCloseModal?: boolean;
    backCollapseExpanded?: boolean;
    preventDefault?: boolean;
    onStep?: (params: {
        el: HTMLElement;
        index: number;
        next: (i?: number) => void;
        step: ITutorialTopicStep;
        signal: AbortSignal;
    }) => void;
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
    <Typography variant='body2' color='text.secondary' {...props} />
);

const StyledImg = styled('img')(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
}));

const PROJECT = 'demo-app';
const ENVIRONMENT = 'dev';

export const TOPICS: ITutorialTopic[] = [
    {
        title: 'How to enable/disable a feature flag',
        steps: [
            {
                title: 'How to enable/disable a feature flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/feature-flags'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Feature flags
                            </a>{' '}
                            are the central concept of Unleash.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Feature flags are organized within{' '}
                            <a
                                href='https://docs.getunleash.io/concepts/projects'
                                target='_blank'
                                rel='noreferrer'
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
                title: 'Control the flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step1-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Now you can disable or enable the feature for
                            everyone by toggling the highlighted switch.
                        </Description>
                        <Badge sx={{ mt: 2 }} icon={<InfoOutlinedIcon />}>
                            Look at the demo page to see your changes!
                        </Badge>
                    </>
                ),
                nextButton: true,
            },
        ],
    },
    {
        title: 'Next: How to enable for a specific user',
        setup: specificUser,
        steps: [
            {
                title: 'Next: How to enable for a specific user',
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Activation strategies
                            </a>{' '}
                            give you more control over when a feature should be
                            enabled.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Let's try enabling a feature flag only for a
                            specific user.
                        </Description>
                    </>
                ),
                nextButton: true,
            },
            {
                title: 'Select a flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: `table a[href="${basePath}/projects/${PROJECT}/features/demoApp.step2"]`,
                content: (
                    <Description>
                        First, open the feature flag configuration for{' '}
                        <Badge as='span'>demoApp.step2</Badge> by using this
                        link.
                    </Description>
                ),
                preventDefault: true,
            },
            {
                title: 'Select an environment',
                href: `/projects/${PROJECT}/features/demoApp.step2`,
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] > div[aria-expanded="false"]`,
                content: (
                    <Description>
                        Expand the environment card to see all the defined
                        strategies.
                    </Description>
                ),
                optional: true,
                delay: 500,
            },
            {
                title: 'Add a strategy',
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] button[data-testid="ADD_STRATEGY_BUTTON"]`,
                content: (
                    <Description>
                        Add a new strategy to this environment by using this
                        button.
                    </Description>
                ),
                delay: 500,
                backCollapseExpanded: true,
            },
            {
                title: 'Select a strategy',
                target: `a[href="${basePath}/projects/${PROJECT}/features/demoApp.step2/strategies/create?environmentId=${ENVIRONMENT}&strategyName=flexibleRollout&defaultStrategy=true"]`,
                content: (
                    <Description>Select the default strategy.</Description>
                ),
                placement: 'right',
                optional: true,
                backCloseModal: true,
            },
            {
                title: 'Narrow down your target audience',
                target: 'button[data-testid="STRATEGY_TARGETING_TAB"]',
                content: (
                    <>
                        <Description>
                            <Typography>Select the Targeting tab.</Typography>
                        </Description>
                    </>
                ),
                backCloseModal: true,
            },
            {
                title: 'Add a constraint',
                target: 'button[data-testid="ADD_CONSTRAINT_BUTTON"]',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies#constraints'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Strategy constraints
                            </a>{' '}
                            are conditions that must be satisfied for an{' '}
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies'
                                target='_blank'
                                rel='noreferrer'
                            >
                                activation strategy
                            </a>{' '}
                            to be evaluated for a feature flag.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Add a constraint by using this button.
                        </Description>
                    </>
                ),
                backCloseModal: true,
            },
            {
                title: 'Select a context',
                target: '#context-field-select',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/unleash-context'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Unleash context
                            </a>{' '}
                            contains information relating to the current feature
                            flag request.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Select the context field by using this dropdown.
                        </Description>
                    </>
                ),
                backCloseModal: true,
                anyClick: true,
            },
            {
                title: 'Select a pre-defined context field',
                target: 'li[data-testid="SELECT_ITEM_ID-userId"]',
                content: (
                    <Description>
                        Select the <Badge as='span'>userId</Badge> context
                        field.
                    </Description>
                ),
                placement: 'right',
                backCloseModal: true,
            },
            {
                title: 'Add constraint value',
                target: 'button[data-testid="CONSTRAINT_ADD_VALUES_BUTTON"]',
                content: (
                    <Description>
                        Add a new constraint value by using this button.
                    </Description>
                ),
                optional: true,
            },
            {
                title: 'Input value',
                target: 'div[data-testid="CONSTRAINT_VALUES_INPUT"]',
                content: (
                    <>
                        <Description>
                            Enter your <Badge as='span'>userId</Badge>
                        </Description>
                        <Badge
                            sx={{ mt: 2, mb: 1, width: '100%' }}
                            icon={<InfoOutlinedIcon />}
                        >
                            You can find your userId on the demo page.
                        </Badge>
                        <StyledImg
                            src={formatAssetPath(demoUserId)}
                            alt='You can find your userId on the demo page.'
                        />
                        <Description sx={{ mt: 1 }}>
                            When you're done, use the "Next" button in the
                            dialog.
                        </Description>
                    </>
                ),
                placement: 'right',
                nextButton: true,
                focus: 'input',
                onStep: ({ el, next, index, signal }) => {
                    const input = el.querySelector('input');

                    input?.addEventListener(
                        'keydown',
                        (e) => {
                            if (e.key === 'Enter' && input.value.trim()) {
                                next(index);
                            }
                        },
                        { signal },
                    );
                },
            },
            {
                title: 'Add value',
                target: 'button[data-testid="CONSTRAINT_VALUES_ADD_BUTTON"]:not(:disabled)',
                content: (
                    <Description>
                        Add the constraint value by using this button.
                    </Description>
                ),
                optional: true,
            },
            {
                title: 'Save constraint setup',
                target: 'button[data-testid="CONSTRAINT_SAVE_BUTTON"]',
                content: (
                    <Description>
                        Save the constraint by using this button.
                    </Description>
                ),
                optional: true,
            },
            {
                title: 'Save strategy for flag',
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                content: (
                    <Description>
                        Save and apply your strategy by using this button.
                    </Description>
                ),
                backCloseModal: true,
            },
            {
                title: 'Confirm your changes',
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
                title: 'Control the flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step2-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Now you can disable or enable the feature for your
                            user by toggling the highlighted switch.
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
        title: 'Next: How to adjust gradual rollout',
        setup: gradualRollout,
        steps: [
            {
                title: 'Next: How to adjust gradual rollout',
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Gradual rollout
                            </a>{' '}
                            is one of the available{' '}
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies'
                                target='_blank'
                                rel='noreferrer'
                            >
                                activation strategies
                            </a>
                            .
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Let's try enabling a feature flag only for a certain
                            percentage of users.
                        </Description>
                    </>
                ),
                nextButton: true,
            },
            {
                title: 'Select a flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: `table a[href="${basePath}/projects/${PROJECT}/features/demoApp.step3"]`,
                content: (
                    <Description>
                        First, open the feature flag configuration for{' '}
                        <Badge as='span'>demoApp.step3</Badge> by using this
                        link.
                    </Description>
                ),
                preventDefault: true,
            },
            {
                title: 'Select an environment',
                href: `/projects/${PROJECT}/features/demoApp.step3`,
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] > div[aria-expanded="false"]`,
                content: (
                    <Description>
                        Expand the environment card to see all the defined
                        strategies.
                    </Description>
                ),
                optional: true,
                delay: 500,
            },
            {
                title: 'Edit strategy',
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] a[data-testid="STRATEGY_EDIT-flexibleRollout"]`,
                content: (
                    <Description>
                        Edit the existing gradual rollout strategy by using the
                        "Edit" button.
                    </Description>
                ),
                backCollapseExpanded: true,
            },
            {
                title: 'Edit rollout',
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
                title: 'Save changes for flag',
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                content: (
                    <Description>
                        Save and apply your strategy by using this button.
                    </Description>
                ),
            },
            {
                title: 'Confirm your changes',
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
                title: 'Control the flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step3-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Now you can disable or enable the feature for the
                            selected percentage of users by toggling the
                            highlighted switch.
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
        title: 'Next: How to adjust variants',
        setup: variants,
        steps: [
            {
                title: 'Next: How to adjust variants',
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/strategy-variants'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Strategy variants
                            </a>{' '}
                            allow you to define different values for a feature
                            flag. They can be used for A/B testing or segmenting
                            your users.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Let's try adding a variant to a strategy.
                        </Description>
                    </>
                ),
                nextButton: true,
            },
            {
                title: 'Select a flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: `table a[href="${basePath}/projects/${PROJECT}/features/demoApp.step4"]`,
                content: (
                    <Description>
                        First, open the feature flag configuration for{' '}
                        <Badge as='span'>demoApp.step4</Badge> by using this
                        link.
                    </Description>
                ),
                preventDefault: true,
            },
            {
                title: 'Select an environment',
                href: `/projects/${PROJECT}/features/demoApp.step4`,
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] > div[aria-expanded="false"]`,
                content: (
                    <Description>
                        Expand the environment card to see all the defined
                        strategies.
                    </Description>
                ),
                optional: true,
                delay: 500,
            },
            {
                title: 'Add a strategy',
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] button[data-testid="ADD_STRATEGY_BUTTON"]`,
                content: (
                    <Description>
                        Add a new strategy to this environment by using this
                        button.
                    </Description>
                ),
                delay: 500,
                backCollapseExpanded: true,
            },
            {
                title: 'Select a strategy',
                target: `a[href="${basePath}/projects/${PROJECT}/features/demoApp.step4/strategies/create?environmentId=${ENVIRONMENT}&strategyName=flexibleRollout&defaultStrategy=true"]`,
                content: (
                    <Description>Select the default strategy.</Description>
                ),
                placement: 'right',
                optional: true,
                backCloseModal: true,
            },
            {
                title: 'Narrow down your target audience',
                target: 'button[data-testid="STRATEGY_TARGETING_TAB"]',
                content: (
                    <>
                        <Description>
                            <Typography>Select the Targeting tab.</Typography>
                        </Description>
                    </>
                ),
                backCloseModal: true,
            },
            {
                title: 'Add a constraint',
                target: 'button[data-testid="ADD_CONSTRAINT_BUTTON"]',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies#constraints'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Strategy constraints
                            </a>{' '}
                            are conditions that must be satisfied for an{' '}
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies'
                                target='_blank'
                                rel='noreferrer'
                            >
                                activation strategy
                            </a>{' '}
                            to be evaluated for a feature flag.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Add a constraint by using this button.
                        </Description>
                    </>
                ),
                backCloseModal: true,
            },
            {
                title: 'Select a context',
                target: '#context-field-select',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/unleash-context'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Unleash context
                            </a>{' '}
                            contains information relating to the current feature
                            flag request.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Select the context field by using this dropdown.
                        </Description>
                    </>
                ),
                backCloseModal: true,
                anyClick: true,
            },
            {
                title: 'Select a pre-defined context field',
                target: 'li[data-testid="SELECT_ITEM_ID-userId"]',
                content: (
                    <Description>
                        Select the <Badge as='span'>userId</Badge> context
                        field.
                    </Description>
                ),
                placement: 'right',
                backCloseModal: true,
            },
            {
                title: 'Add constraint value',
                target: 'button[data-testid="CONSTRAINT_ADD_VALUES_BUTTON"]',
                content: (
                    <Description>
                        Add a new constraint value by using this button.
                    </Description>
                ),
                optional: true,
            },
            {
                title: 'Input value',
                target: 'div[data-testid="CONSTRAINT_VALUES_INPUT"]',
                content: (
                    <>
                        <Description>
                            Enter your <Badge as='span'>userId</Badge>
                        </Description>
                        <Badge
                            sx={{ mt: 2, mb: 1, width: '100%' }}
                            icon={<InfoOutlinedIcon />}
                        >
                            You can find your userId on the demo page.
                        </Badge>
                        <StyledImg
                            src={formatAssetPath(demoUserId)}
                            alt='You can find your userId on the demo page.'
                        />
                        <Description sx={{ mt: 1 }}>
                            When you're done, use the "Next" button in the
                            dialog.
                        </Description>
                    </>
                ),
                placement: 'right',
                nextButton: true,
                focus: 'input',
                onStep: ({ el, next, index, signal }) => {
                    const input = el.querySelector('input');

                    input?.addEventListener(
                        'keydown',
                        (e) => {
                            if (e.key === 'Enter' && input.value.trim()) {
                                next(index);
                            }
                        },
                        { signal },
                    );
                },
            },
            {
                title: 'Add value',
                target: 'button[data-testid="CONSTRAINT_VALUES_ADD_BUTTON"]:not(:disabled)',
                content: (
                    <Description>
                        Add the constraint value by using this button.
                    </Description>
                ),
                optional: true,
            },
            {
                title: 'Save constraint setup',
                target: 'button[data-testid="CONSTRAINT_SAVE_BUTTON"]',
                content: (
                    <Description>
                        Save the constraint by using this button.
                    </Description>
                ),
                optional: true,
            },
            {
                title: 'Set up a variant',
                target: 'button[data-testid="STRATEGY_VARIANTS_TAB"]',
                content: (
                    <>
                        <Description>
                            <Typography>Select the Variants tab.</Typography>
                        </Description>
                    </>
                ),
                backCloseModal: true,
            },
            {
                title: 'Add new variant',
                target: 'button[data-testid="ADD_STRATEGY_VARIANT_BUTTON"]',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/concepts/strategy-variants'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Strategy variants
                            </a>{' '}
                            allow to attach one or more values to your{' '}
                            <a
                                href='https://docs.getunleash.io/concepts/activation-strategies'
                                target='_blank'
                                rel='noreferrer'
                            >
                                activation strategy
                            </a>{' '}
                            .
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            Add a strategy variant by using this button.
                        </Description>
                    </>
                ),
                backCloseModal: true,
            },
            {
                title: 'Input variant name',
                target: 'div[data-testid="VARIANT"]:last-of-type div[data-testid="VARIANT_NAME_INPUT"]',
                content: (
                    <>
                        <Description>
                            Enter a name for your variant e.g.{' '}
                            <Badge as='span'>color</Badge>
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            When you're done, use the "Next" button in the
                            dialog.
                        </Description>
                    </>
                ),
                nextButton: true,
                focus: 'input',
                backCloseModal: true,
            },
            {
                title: 'Input variant value',
                target: 'div[data-testid="VARIANT"]:last-of-type #variant-payload-value',
                content: (
                    <>
                        <Description>
                            Enter a{' '}
                            <a
                                href='https://developer.mozilla.org/en-US/docs/Web/CSS/named-color'
                                target='_blank'
                                rel='noreferrer'
                            >
                                color
                            </a>{' '}
                            as the payload. It will be passed along and used in
                            the demo website.
                        </Description>
                        <Description sx={{ mt: 1 }}>
                            It can be any color. For example, you can use one of
                            these: <Badge as='span'>teal</Badge>,{' '}
                            <Badge as='span'>orange</Badge> or{' '}
                            <Badge as='span'>purple</Badge>
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
                title: 'Save strategy for flag',
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                content: (
                    <Description>
                        Save and apply your strategy by using this button.
                    </Description>
                ),
                backCloseModal: true,
            },
            {
                title: 'Control the flag',
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step4-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Now you can disable or enable the feature with the
                            new variant by toggling the highlighted switch.
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
