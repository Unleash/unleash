import { Typography, type TypographyProps, styled } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge } from 'component/common/Badge/Badge';
import type { Step } from 'react-joyride';
import { specificUser, gradualRollout, variants } from './demo-setup';
import { basePath, formatAssetPath } from 'utils/formatPath';
import demoUserId from 'assets/img/demo-userid.png';

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
    <Typography variant='body2' color='text.secondary' {...props} />
);

const StyledImg = styled('img')(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
}));

const PROJECT = 'demo-app';
const ENVIRONMENT = 'dev';

export const TOPICS: ITutorialTopic[] = [
    {
        title: 'Enable/disable a feature flag',
        steps: [
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/reference/feature-toggles'
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
                                href='https://docs.getunleash.io/reference/projects'
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
                href: `/projects/${PROJECT}?sort=name`,
                target: `div[data-testid="TOGGLE-demoApp.step1-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Enable or disable the feature for everyone by
                            toggling the highlighted switch.
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
        title: 'Enable for a specific user',
        setup: specificUser,
        steps: [
            {
                href: `/projects/${PROJECT}?sort=name`,
                target: 'body',
                placement: 'center',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/reference/activation-strategies'
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
                href: `/projects/${PROJECT}/features/demoApp.step2`,
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] button`,
                content: (
                    <Description>
                        Add a new strategy to this environment by using this
                        button.
                    </Description>
                ),
            },
            {
                target: `a[href="${basePath}/projects/${PROJECT}/features/demoApp.step2/strategies/create?environmentId=${ENVIRONMENT}&strategyName=default&defaultStrategy=false"]`,
                content: (
                    <Description>
                        Select the <Badge as='span'>Standard</Badge> strategy
                        type.
                    </Description>
                ),
                placement: 'right',
                optional: true,
                backCloseModal: true,
            },
            {
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
                target: 'button[data-testid="ADD_CONSTRAINT_BUTTON"]',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/reference/strategy-constraints'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Strategy constraints
                            </a>{' '}
                            are conditions that must be satisfied for an{' '}
                            <a
                                href='https://docs.getunleash.io/reference/activation-strategies'
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
                target: '#context-field-select',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/reference/unleash-context'
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
            },
            {
                target: 'button[data-testid="CONSTRAINT_VALUES_ADD_BUTTON"]',
                content: (
                    <Description>
                        Add the constraint value by using this button.
                    </Description>
                ),
            },
            {
                target: 'button[data-testid="CONSTRAINT_SAVE_BUTTON"]',
                content: (
                    <Description>
                        Save the constraint by using this button.
                    </Description>
                ),
            },
            {
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                content: (
                    <Description>
                        Save and apply your strategy by using this button.
                    </Description>
                ),
                backCloseModal: true,
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
                target: `div[data-testid="TOGGLE-demoApp.step2-${ENVIRONMENT}"]`,
                content: (
                    <>
                        <Description>
                            Finally, enable or disable the feature for your user
                            by toggling the highlighted switch.
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
                                href='https://docs.getunleash.io/reference/activation-strategies#gradual-rollout'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Gradual rollout
                            </a>{' '}
                            is one of the available{' '}
                            <a
                                href='https://docs.getunleash.io/reference/activation-strategies'
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
                                href='https://docs.getunleash.io/reference/strategy-variants'
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
                href: `/projects/${PROJECT}/features/demoApp.step4`,
                target: `div[data-testid="FEATURE_ENVIRONMENT_ACCORDION_${ENVIRONMENT}"] button`,
                content: (
                    <Description>
                        Add a new strategy to this environment by using this
                        button.
                    </Description>
                ),
            },
            {
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
                target: 'button[data-testid="ADD_CONSTRAINT_BUTTON"]',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/reference/strategy-constraints'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Strategy constraints
                            </a>{' '}
                            are conditions that must be satisfied for an{' '}
                            <a
                                href='https://docs.getunleash.io/reference/activation-strategies'
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
                target: '#context-field-select',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/reference/unleash-context'
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
            },
            {
                target: 'button[data-testid="CONSTRAINT_VALUES_ADD_BUTTON"]',
                content: (
                    <Description>
                        Add the constraint value by using this button.
                    </Description>
                ),
            },
            {
                target: 'button[data-testid="CONSTRAINT_SAVE_BUTTON"]',
                content: (
                    <Description>
                        Save the constraint by using this button.
                    </Description>
                ),
            },
            {
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
                target: 'button[data-testid="ADD_STRATEGY_VARIANT_BUTTON"]',
                content: (
                    <>
                        <Description>
                            <a
                                href='https://docs.getunleash.io/reference/strategy-variants'
                                target='_blank'
                                rel='noreferrer'
                            >
                                Strategy variants
                            </a>{' '}
                            allow to attach one or more values to your{' '}
                            <a
                                href='https://docs.getunleash.io/reference/activation-strategies'
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
                target: 'button[data-testid="STRATEGY_FORM_SUBMIT_ID"]',
                content: (
                    <Description>
                        Save and apply your strategy by using this button.
                    </Description>
                ),
                backCloseModal: true,
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
