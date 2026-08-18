import {
    Box,
    Chip,
    IconButton,
    Link,
    styled,
    Switch,
    Tooltip,
    Typography,
} from '@mui/material';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import AddIcon from '@mui/icons-material/Add';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { HintBadge } from './introHints.tsx';
import {
    INTRO_COUNTRIES,
    INTRO_PLANS,
    type IntroFlagConfig,
    type IntroUser,
} from './introModel.js';
import { IntroRolloutSlider } from './IntroRolloutSlider.tsx';
import { IntroVariantsBar } from './IntroVariantsBar.tsx';

const StyledFlagHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledFlagName = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
}));

const StyledEnvironmentCard = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    overflow: 'hidden',
}));

const StyledEnvironmentHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    background: theme.palette.background.paper,
}));

const StyledEnvironmentText = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledEnvironmentName = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
}));

const StyledEnvironmentStatus = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledStrategyBody = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'dimmed',
})<{ dimmed?: boolean }>(({ theme, dimmed }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
    background: theme.palette.background.elevation2,
    opacity: dimmed ? 0.6 : 1,
    transition: theme.transitions.create('opacity'),
}));

const StyledSectionTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledConfigurationSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledVariantsControl = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledVariantsBarWrapper = styled(Box)({
    flex: 1,
    minWidth: 0,
});

const StyledAddVariantButton = styled(IconButton)(({ theme }) => ({
    flexShrink: 0,
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    '&:hover': {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
    },
}));

const StyledRolloutWrapper = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(-1),
}));

const StyledConstraintRow = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `${theme.spacing(8)} auto minmax(0, 1fr)`,
    alignItems: 'start',
    gap: theme.spacing(1),
    minHeight: theme.spacing(3.5),
}));

const StyledConstraintField = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
}));

const StyledConstraintOperatorGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledConstraintValues = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    minWidth: 0,
}));

const StyledDisabledOperatorChip = styled(Chip)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: theme.spacing(0.25, 0),
    fontSize: theme.fontSizes.smallerBody,
    height: 'auto',
    background: theme.palette.background.elevation2,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.disabled,
    fontWeight: theme.typography.fontWeightBold,
    cursor: 'help',
    userSelect: 'none',
    '& .MuiChip-label': {
        cursor: 'help',
        textDecoration: 'line-through',
    },
}));

const constraintOperator = (hasSelection: boolean) =>
    hasSelection ? (
        <StrategyEvaluationChip label='is one of' />
    ) : (
        <Tooltip
            arrow
            title='No values selected, so this constraint does not narrow the audience.'
        >
            <StyledDisabledOperatorChip label='is one of' size='small' />
        </Tooltip>
    );

const StyledConstraintValue = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
    height: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${
        selected ? theme.palette.primary.main : 'transparent'
    }`,
    backgroundColor: selected
        ? theme.palette.secondary.light
        : theme.palette.background.elevation2,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    boxShadow: 'none',
    transition: theme.transitions.create(
        ['background-color', 'border-color', 'color'],
        {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.easeOut,
        },
    ),
    '&:hover': {
        backgroundColor: selected
            ? theme.palette.secondary.light
            : theme.palette.action.hover,
    },
    '&.MuiChip-clickable:active': {
        boxShadow: 'none',
    },
    '&.Mui-focusVisible': {
        boxShadow: 'none',
        backgroundColor: selected
            ? theme.palette.secondary.light
            : theme.palette.background.elevation2,
    },
    '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
    },
}));

interface IIntroFlagViewProps {
    config: IntroFlagConfig;
    showConstraints: boolean;
    showVariants: boolean;
    selectedVariant?: string;
    onEnvironmentChange: (enabled: boolean) => void;
    onRolloutChange: (value: number) => void;
    onToggleCountry: (code: string) => void;
    onTogglePlan: (plan: IntroUser['plan']) => void;
    onAddVariant: () => void;
    onWeightsChange: (weights: number[]) => void;
    /** Draw a nudge on the production toggle while it is still untouched. */
    highlightEnvironment?: boolean;
    /** Nudge the user to try a constraint if they haven't touched one. */
    highlightConstraints?: boolean;
    /** Nudge the user to try the variant controls if they haven't touched them. */
    highlightVariants?: boolean;
}

const selectableChip = (
    label: string,
    selected: boolean,
    onClick: () => void,
) => (
    <StyledConstraintValue
        key={label}
        label={label}
        size='small'
        selected={selected}
        onClick={onClick}
        aria-pressed={selected}
    />
);

/**
 * A compact, working facsimile of an Unleash gradual-rollout strategy. Its
 * constraint rows intentionally mirror the product's field/operator/value
 * structure instead of inventing an intro-specific control.
 */
export const IntroFlagView = ({
    config,
    showConstraints,
    showVariants,
    selectedVariant,
    onEnvironmentChange,
    onRolloutChange,
    onToggleCountry,
    onTogglePlan,
    onAddVariant,
    onWeightsChange,
    highlightEnvironment,
    highlightConstraints,
    highlightVariants,
}: IIntroFlagViewProps) => {
    // "all users" only when nothing narrows the audience (every country and
    // plan selected, or no constraint at all); otherwise "targeted users".
    const allCountriesSelected =
        config.targetCountryCodes.length === 0 ||
        config.targetCountryCodes.length === INTRO_COUNTRIES.length;
    const allPlansSelected =
        !config.targetPlans?.length ||
        config.targetPlans.length === INTRO_PLANS.length;
    const audienceScope =
        allCountriesSelected && allPlansSelected
            ? 'all users'
            : 'targeted users';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <StyledFlagHeader>
                <OutlinedFlagIcon fontSize='small' color='primary' />
                <StyledFlagName>{config.flagName}</StyledFlagName>
            </StyledFlagHeader>

            <StyledEnvironmentCard>
                <StyledEnvironmentHeader>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <Switch
                            checked={config.environmentEnabled}
                            onChange={(event) =>
                                onEnvironmentChange(event.target.checked)
                            }
                            slotProps={{
                                input: {
                                    'aria-label':
                                        'Toggle my-feature in production',
                                },
                            }}
                            data-testid='QUICK_TOUR_INTRO_ONOFF_SWITCH'
                        />
                        <HintBadge
                            active={Boolean(highlightEnvironment)}
                            title='Turn on my-feature in production'
                            placement='top'
                            sx={{ top: 2, right: 4 }}
                        />
                    </Box>
                    <StyledEnvironmentText>
                        <StyledEnvironmentName>
                            Production environment
                        </StyledEnvironmentName>
                        <StyledEnvironmentStatus>
                            {config.environmentEnabled
                                ? `On for ${config.rollout}% of ${audienceScope}`
                                : 'Off for all users'}
                        </StyledEnvironmentStatus>
                    </StyledEnvironmentText>
                </StyledEnvironmentHeader>

                <StyledStrategyBody dimmed={!config.environmentEnabled}>
                    {showConstraints ? (
                        <StyledConfigurationSection
                            sx={{ position: 'relative' }}
                        >
                            <HintBadge
                                active={Boolean(highlightConstraints)}
                                title='Try targeting by country or plan'
                                placement='top'
                                sx={{ top: 12, right: 12 }}
                            />
                            <StyledSectionTitle data-testid='QUICK_TOUR_INTRO_CONSTRAINTS_TITLE'>
                                <span>Constraints</span>
                                <HelpIcon
                                    htmlTooltip
                                    tooltip={
                                        <>
                                            <Typography
                                                variant='body2'
                                                component='p'
                                                sx={{ mb: 1 }}
                                            >
                                                Constraints are conditions based
                                                on Unleash context. Every
                                                constraint on a strategy must
                                                match before the strategy
                                                applies.
                                            </Typography>
                                            <Link
                                                href='https://docs.getunleash.io/concepts/activation-strategies#constraints'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                variant='body2'
                                            >
                                                Read more in the documentation
                                            </Link>
                                        </>
                                    }
                                />
                            </StyledSectionTitle>
                            <StyledConstraintRow>
                                <StyledConstraintField>
                                    Country
                                </StyledConstraintField>
                                <StyledConstraintOperatorGroup>
                                    {constraintOperator(
                                        config.targetCountryCodes.length > 0,
                                    )}
                                </StyledConstraintOperatorGroup>
                                <StyledConstraintValues>
                                    {INTRO_COUNTRIES.map((country) =>
                                        selectableChip(
                                            country.label,
                                            config.targetCountryCodes.includes(
                                                country.code,
                                            ),
                                            () => onToggleCountry(country.code),
                                        ),
                                    )}
                                </StyledConstraintValues>
                            </StyledConstraintRow>
                            <StyledConstraintRow>
                                <StyledConstraintField>
                                    Plan
                                </StyledConstraintField>
                                <StyledConstraintOperatorGroup>
                                    {constraintOperator(
                                        Boolean(config.targetPlans?.length),
                                    )}
                                </StyledConstraintOperatorGroup>
                                <StyledConstraintValues>
                                    {INTRO_PLANS.map((plan) =>
                                        selectableChip(
                                            plan.label,
                                            Boolean(
                                                config.targetPlans?.includes(
                                                    plan.value,
                                                ),
                                            ),
                                            () => onTogglePlan(plan.value),
                                        ),
                                    )}
                                </StyledConstraintValues>
                            </StyledConstraintRow>
                        </StyledConfigurationSection>
                    ) : null}

                    <StyledConfigurationSection>
                        <StyledSectionTitle>
                            <span>Gradual rollout</span>
                            <HelpIcon
                                htmlTooltip
                                tooltip={
                                    <>
                                        <Typography
                                            variant='body2'
                                            component='p'
                                            sx={{ mb: 1 }}
                                        >
                                            Release a feature to a percentage of
                                            your audience and increase it over
                                            time. Unleash keeps each person's
                                            experience consistent as the rollout
                                            changes.
                                        </Typography>
                                        <Link
                                            href='https://docs.getunleash.io/guides/gradual-rollout'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            variant='body2'
                                        >
                                            Read more in the documentation
                                        </Link>
                                    </>
                                }
                            />
                        </StyledSectionTitle>
                        <StyledRolloutWrapper>
                            <IntroRolloutSlider
                                name='Rollout %'
                                value={config.rollout}
                                onChange={onRolloutChange}
                            />
                        </StyledRolloutWrapper>
                    </StyledConfigurationSection>

                    {showVariants ? (
                        <StyledConfigurationSection>
                            <StyledSectionTitle data-testid='QUICK_TOUR_INTRO_VARIANTS_TITLE'>
                                <span>Variants</span>
                                <HelpIcon
                                    htmlTooltip
                                    tooltip={
                                        <>
                                            <Typography
                                                variant='body2'
                                                component='p'
                                                sx={{ mb: 1 }}
                                            >
                                                Variants split enabled users
                                                between different feature
                                                experiences. Assignments are
                                                sticky, so each user keeps the
                                                same experience while you
                                                measure the results.
                                            </Typography>
                                            <Link
                                                href='https://docs.getunleash.io/concepts/strategy-variants'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                variant='body2'
                                            >
                                                Read more in the documentation
                                            </Link>
                                        </>
                                    }
                                />
                            </StyledSectionTitle>
                            <StyledVariantsControl>
                                <StyledVariantsBarWrapper>
                                    <IntroVariantsBar
                                        variants={config.variants}
                                        selected={selectedVariant}
                                        onWeightsChange={onWeightsChange}
                                    />
                                </StyledVariantsBarWrapper>
                                {config.variants.length < 4 ? (
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                        }}
                                    >
                                        <Tooltip title='Add variant' arrow>
                                            <StyledAddVariantButton
                                                size='small'
                                                aria-label='Add variant'
                                                onClick={onAddVariant}
                                                data-testid='QUICK_TOUR_INTRO_ADD_VARIANT_BUTTON'
                                            >
                                                <AddIcon fontSize='small' />
                                            </StyledAddVariantButton>
                                        </Tooltip>
                                        <HintBadge
                                            active={Boolean(highlightVariants)}
                                            title='Add a variant or drag the slider to split traffic'
                                            placement='top'
                                            sx={{ top: -6, right: -6 }}
                                        />
                                    </Box>
                                ) : null}
                            </StyledVariantsControl>
                        </StyledConfigurationSection>
                    ) : null}
                </StyledStrategyBody>
            </StyledEnvironmentCard>
        </Box>
    );
};
