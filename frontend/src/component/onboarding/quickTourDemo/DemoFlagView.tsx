import {
    alpha,
    Box,
    Button,
    Chip,
    IconButton,
    styled,
    Switch,
    Tooltip,
    useTheme,
} from '@mui/material';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { DEMO_COUNTRIES, type DemoFlagConfig } from './demoModel.js';
import { DemoRolloutSlider } from './DemoRolloutSlider.tsx';
import { DemoVariantsBar } from './DemoVariantsBar.tsx';

export const MAX_VARIANTS = 4;
export const MIN_VARIANTS = 2;

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
    background: theme.palette.background.elevation1,
}));

const StyledEnvironmentName = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    marginRight: 'auto',
}));

// A uniform gap keeps every section's content vertically centred between its
// own divider and the next one.
const StyledStrategyBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
}));

// Titled horizontal separator - splits the strategy into its three sections
// (rollout, constraints, variants) like the real strategy configuration.
const StyledSectionDivider = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: '0.08em',
    '&::after': {
        content: '""',
        flex: 1,
        height: 1,
        background: theme.palette.divider,
    },
}));

// The slider's built-in mark labels and margins leave dead space below the
// track; a negative margin pulls the next section back up so the slider sits
// centred between the dividers.
const StyledRolloutWrapper = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(-2),
}));

const StyledConstraintRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
}));

// Keeps "country" and "is any of" locked together on the left so the chips
// always start on the same line as the operator and only wrap among
// themselves - never lifting a lone flag chip off onto a line by itself.
const StyledConstraintLabel = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
    // Align with the first row of chips when the chips wrap.
    minHeight: 24,
}));

const StyledCountryChips = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    flex: 1,
    minWidth: 0,
}));

const StyledConstraintField = styled('code')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledConstraintOperator = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: theme.spacing(0.25, 0.75),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.12),
}));

const StyledVariantRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledVariantDot = styled('span')<{ color: string }>(({ color }) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
}));

const StyledVariantName = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    width: theme.spacing(2),
}));

const StyledVariantWeight = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    fontVariantNumeric: 'tabular-nums',
    width: theme.spacing(4.5),
    textAlign: 'right',
}));

const StyledVariantPayload = styled('code')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    background: theme.palette.background.elevation1,
    padding: theme.spacing(0.25, 0.75),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
}));

interface IDemoFlagViewProps {
    config: DemoFlagConfig;
    /** Sections revealed so far - the flag grows as the tour progresses. */
    showStrategy: boolean;
    showConstraints: boolean;
    showVariants: boolean;
    selectedVariant?: string;
    onEnvironmentChange: (enabled: boolean) => void;
    onRolloutChange: (value: number) => void;
    onToggleCountry: (code: string) => void;
    onAddVariant: () => void;
    onRemoveVariant: (name: string) => void;
    /** New integer weights (summing to 100), in variant order. */
    onWeightsChange: (weights: number[]) => void;
}

/**
 * A miniature, fully working feature-flag page: flag header, environment
 * switch, and one gradual-rollout strategy that gains a constraint and
 * variants as the tour progresses. Deliberately shaped like the real flag
 * screen so the first real flag the user opens already feels familiar.
 */
export const DemoFlagView = ({
    config,
    showStrategy,
    showConstraints,
    showVariants,
    selectedVariant,
    onEnvironmentChange,
    onRolloutChange,
    onToggleCountry,
    onAddVariant,
    onRemoveVariant,
    onWeightsChange,
}: IDemoFlagViewProps) => {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <StyledFlagHeader>
                <OutlinedFlagIcon fontSize='small' color='primary' />
                <StyledFlagName>{config.flagName}</StyledFlagName>
                <Chip label='Release' size='small' variant='outlined' />
            </StyledFlagHeader>

            <StyledEnvironmentCard>
                <StyledEnvironmentHeader>
                    <CloudCircleIcon fontSize='small' color='disabled' />
                    <StyledEnvironmentName>production</StyledEnvironmentName>
                    <Switch
                        checked={config.environmentEnabled}
                        onChange={(event) =>
                            onEnvironmentChange(event.target.checked)
                        }
                        size='small'
                        slotProps={{
                            input: {
                                'aria-label':
                                    'Toggle the feature in production',
                            },
                        }}
                        data-testid='QUICK_TOUR_DEMO_ONOFF_SWITCH'
                    />
                </StyledEnvironmentHeader>

                {showStrategy ? (
                    <StyledStrategyBody>
                        <StyledSectionDivider>Rollout</StyledSectionDivider>
                        <StyledRolloutWrapper>
                            <DemoRolloutSlider
                                name='Rollout %'
                                value={config.rollout}
                                onChange={onRolloutChange}
                            />
                        </StyledRolloutWrapper>

                        {showConstraints ? (
                            <>
                                <StyledSectionDivider>
                                    Constraints
                                </StyledSectionDivider>
                                <StyledConstraintRow>
                                    <StyledConstraintLabel>
                                        <StyledConstraintField>
                                            country
                                        </StyledConstraintField>
                                        <StyledConstraintOperator>
                                            is any of
                                        </StyledConstraintOperator>
                                    </StyledConstraintLabel>
                                    <StyledCountryChips>
                                        {DEMO_COUNTRIES.map((country) => {
                                            const active =
                                                config.targetCountryCodes.includes(
                                                    country.code,
                                                );
                                            return (
                                                <Chip
                                                    key={country.code}
                                                    label={`${country.flag} ${country.code}`}
                                                    size='small'
                                                    color={
                                                        active
                                                            ? 'primary'
                                                            : 'default'
                                                    }
                                                    variant={
                                                        active
                                                            ? 'filled'
                                                            : 'outlined'
                                                    }
                                                    onClick={() =>
                                                        onToggleCountry(
                                                            country.code,
                                                        )
                                                    }
                                                />
                                            );
                                        })}
                                    </StyledCountryChips>
                                </StyledConstraintRow>
                            </>
                        ) : null}

                        {showVariants ? (
                            <>
                                <StyledSectionDivider>
                                    Variants
                                </StyledSectionDivider>
                                <DemoVariantsBar
                                    variants={config.variants}
                                    selected={selectedVariant}
                                    onWeightsChange={onWeightsChange}
                                />
                                {config.variants.map((variant, index) => (
                                    <StyledVariantRow key={variant.name}>
                                        <StyledVariantDot
                                            color={
                                                variant.color ??
                                                theme.palette.variants[
                                                    index %
                                                        theme.palette.variants
                                                            .length
                                                ]
                                            }
                                        />
                                        <StyledVariantName>
                                            {variant.name}
                                        </StyledVariantName>
                                        <StyledVariantWeight>
                                            {Math.round(variant.weight)}%
                                        </StyledVariantWeight>
                                        <Tooltip title={variant.payload} arrow>
                                            <StyledVariantPayload>
                                                {variant.payload}
                                            </StyledVariantPayload>
                                        </Tooltip>
                                        <IconButton
                                            size='small'
                                            aria-label={`Remove variant ${variant.name}`}
                                            disabled={
                                                config.variants.length <=
                                                MIN_VARIANTS
                                            }
                                            onClick={() =>
                                                onRemoveVariant(variant.name)
                                            }
                                        >
                                            <DeleteOutlineIcon fontSize='inherit' />
                                        </IconButton>
                                    </StyledVariantRow>
                                ))}
                                <Box>
                                    <Button
                                        size='small'
                                        startIcon={<AddIcon />}
                                        disabled={
                                            config.variants.length >=
                                            MAX_VARIANTS
                                        }
                                        onClick={onAddVariant}
                                        data-testid='QUICK_TOUR_DEMO_ADD_VARIANT_BUTTON'
                                    >
                                        Add variant
                                    </Button>
                                </Box>
                            </>
                        ) : null}
                    </StyledStrategyBody>
                ) : null}
            </StyledEnvironmentCard>
        </Box>
    );
};
