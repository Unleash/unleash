import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
    Box,
    styled,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    type Theme,
    Typography,
} from '@mui/material';
import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import type { FailedVariantsSubmit } from './useStrategyFormValidation.ts';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import produce from 'immer';
import { FeatureStrategyType } from '../FeatureStrategyType/FeatureStrategyType.tsx';
import type { IFormErrors } from 'hooks/useFormErrors';
import { FeatureStrategyTitle } from './FeatureStrategyTitle/FeatureStrategyTitle.tsx';
import {
    FeatureStrategyTargetAudience,
    type TargetAudience,
} from './FeatureStrategyTargetAudience/FeatureStrategyTargetAudience.tsx';
import { StrategyVariants } from 'component/feature/StrategyTypes/StrategyVariants';
import type { ParametersSchema } from 'openapi/index.ts';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { parseParameterNumber } from 'utils/parseParameter.ts';
import { PlainTextDescription } from './PlainTextDescription/PlainTextDescription.tsx';
import { ActiveStateSelector } from './ActiveStateSelector.tsx';
import { parameterFocusKey, useFocusSection } from './formFocus.tsx';
import { Badge } from 'component/common/Badge/Badge';
import { formatStrategyName } from 'utils/strategyNames';
import { Truncator } from 'component/common/Truncator/Truncator';

export interface StrategyFormBodyProps<T extends StrategyFormState> {
    strategy: T;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    strategyDefinition: IStrategy;
    errors: IFormErrors;
    failedVariantsSubmit?: FailedVariantsSubmit;
    clearFailedVariantsSubmit?: () => void;

    validateParameter?: (name: string, value: ParametersSchema[string]) => void;
    canRenamePreexistingVariants?: boolean;
    payloadSchema?: JsonSchemaProperty;

    alertContent?: React.ReactNode;
    allowEnableDisable?: boolean;
    statusContent?: React.ReactNode;
    beforeFooter?: React.ReactNode;
    groupIdTooltip?: React.ReactNode;
    children?: React.ReactNode;

    onSubmit: (event: React.FormEvent) => void;
}

const pluralize = (count: number, noun: string) =>
    `${count} ${noun}${count === 1 ? '' : 's'}`;

const StyledHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    paddingInline: 'var(--form-inset)',
    paddingBlock: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,

    // prevent mobile guidance info button from obscuring header content
    '[data-form-container]:has([data-mobile-guidance-state="collapsed"]) &': {
        marginInlineEnd: theme.spacing(2.5),
    },
    transition: theme.transitions.create('margin-inline-end', {
        duration: 500,
        easing: theme.transitions.easing.easeInOut,
    }),
}));

const TitleGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    overflow: 'hidden',
    boxShadow: theme.boxShadows.elevated,
}));

const accordionSummarySlotProps = (theme: Theme) => ({
    root: {
        sx: {
            minHeight: '48px',
            '&.Mui-expanded': {
                minHeight: '48px',
            },
        },
    },
    content: {
        sx: {
            justifyContent: 'space-between',
            alignItems: 'center',
            marginRight: theme.spacing(1.5),
        },
    },
});

const AccordionTitle = styled('h2')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const AccordionHeader = styled('hgroup')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
}));

const AccordionSubtitle = styled('p')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledAccordionHint = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    '.Mui-expanded &': {
        display: 'none',
    },
}));

const StyledForm = styled('form')(({ theme }) => ({
    '--form-inset': theme.spacing(3),
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
}));

const FormScrollArea = styled('div')({
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
});

const FormMainContent = styled('div')(({ theme }) => ({
    flex: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingBlock: theme.spacing(4),
    paddingInline: 'var(--form-inset)',
}));

const FooterContent = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingInline: 'var(--form-inset)',
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(2),
}));

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'end',
}));

export const StrategyFormBody = <T extends StrategyFormState>({
    strategy,
    setStrategy,
    strategyDefinition,
    errors,
    failedVariantsSubmit,
    clearFailedVariantsSubmit,
    validateParameter,
    canRenamePreexistingVariants,
    payloadSchema,
    alertContent, // todo: rename to changeRequestAlert when deleting the singlePageStrategyForm flag
    allowEnableDisable,
    statusContent: environmentDisabledText, // todo: consider renaming prop when deleting singlePageStrategyForm flag
    beforeFooter,
    groupIdTooltip,
    children,
    onSubmit,
}: StrategyFormBodyProps<T>) => {
    const theme = useTheme();
    const [parametersExpanded, setParametersExpanded] = useState(true);
    const parameterFocusKeys = strategyDefinition.parameters.map((parameter) =>
        parameterFocusKey(parameter.name),
    );
    useFocusSection(parameterFocusKeys, () => setParametersExpanded(true));
    const [variantsExpanded, setVariantsExpanded] = useState(false);
    useEffect(() => {
        if (failedVariantsSubmit) {
            setVariantsExpanded(true);
        }
    }, [failedVariantsSubmit]);

    const stickiness =
        strategy?.parameters && 'stickiness' in strategy?.parameters
            ? String(strategy.parameters.stickiness)
            : 'default';

    useEffect(() => {
        const nextVariants = (strategy.variants || []).map((variant) => ({
            stickiness,
            name: variant.name,
            weight: variant.weight,
            payload: variant.payload,
            weightType: variant.weightType,
        }));

        const changed = nextVariants.some(
            (variant, index) =>
                variant.stickiness !== strategy.variants?.[index]?.stickiness,
        );
        if (!changed) return;

        setStrategy((prev) => ({ ...prev, variants: nextVariants }));
    }, [stickiness, strategy.variants, setStrategy]);

    const showVariants = Boolean(
        strategy.parameters && 'stickiness' in strategy.parameters,
    );

    const [explicitTargetAudience, setExplicitTargetAudience] =
        useState<TargetAudience>();
    const targetAudience: TargetAudience =
        explicitTargetAudience ??
        (!strategy.constraints?.length && !strategy.segments?.length
            ? 'everyone'
            : 'subset');

    const targetingBackupRef = useRef<
        | {
              constraints?: T['constraints'];
              segments?: T['segments'];
          }
        | undefined
    >(undefined);

    const handleTargetAudienceChange = (nextTargetAudience: TargetAudience) => {
        setExplicitTargetAudience(nextTargetAudience);

        if (nextTargetAudience === 'everyone') {
            targetingBackupRef.current = {
                constraints: strategy.constraints,
                segments: strategy.segments,
            };
            setStrategy((prev) => ({
                ...prev,
                constraints: [],
                segments: [],
            }));
        } else {
            const backup = targetingBackupRef.current;
            setStrategy((prev) => ({
                ...prev,
                constraints: backup?.constraints ?? prev.constraints,
                segments: backup?.segments ?? prev.segments,
            }));
        }
    };

    const isFlexibleRollout = strategy.name === 'flexibleRollout';
    const rolloutHint = isFlexibleRollout
        ? `${Math.round(parseParameterNumber(strategy.parameters?.rollout || '100'))}%`
        : '';

    const updateParameter = (name: string, value: string) => {
        setStrategy(
            produce((draft) => {
                draft.parameters = draft.parameters ?? {};
                draft.parameters[name] = value;
            }),
        );
        validateParameter?.(name, value);
    };

    const strategyTypeName = formatStrategyName(strategyDefinition.name);

    const handleTitleChange = (title: string) => {
        setStrategy((prev) => ({
            ...prev,
            title,
        }));
    };

    return (
        <StyledForm
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSubmit(e);
            }}
        >
            <FormScrollArea>
                <StyledHeaderBox>
                    <TitleGroup>
                        <Typography variant='h3' component='h1'>
                            Configure strategy
                        </Typography>
                        <Badge color='disabled'>
                            <Truncator
                                title={strategyTypeName}
                                sx={{ maxWidth: 200 }}
                            >
                                {strategyTypeName}
                            </Truncator>
                        </Badge>
                    </TitleGroup>
                    {allowEnableDisable ? (
                        <ActiveStateSelector
                            currentState={
                                strategy.disabled ? 'inactive' : 'active'
                            }
                            onChange={(status) =>
                                setStrategy((prev) => ({
                                    ...prev,
                                    disabled: status === 'inactive',
                                }))
                            }
                        />
                    ) : null}
                </StyledHeaderBox>

                <FormMainContent>
                    <FeatureStrategyTitle
                        title={strategy.title || ''}
                        setTitle={handleTitleChange}
                    />

                    <StyledAccordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            slotProps={accordionSummarySlotProps(theme)}
                        >
                            <AccordionHeader>
                                <AccordionTitle>Target audience</AccordionTitle>
                                <AccordionSubtitle>
                                    Who the strategy applies to
                                </AccordionSubtitle>
                            </AccordionHeader>
                            <StyledAccordionHint>
                                {targetAudience === 'everyone'
                                    ? `Everyone in the selected environment`
                                    : 'A subset of users'}
                            </StyledAccordionHint>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FeatureStrategyTargetAudience
                                strategy={strategy}
                                setStrategy={setStrategy}
                                targetAudience={targetAudience}
                                onTargetAudienceChange={
                                    handleTargetAudienceChange
                                }
                            />
                        </AccordionDetails>
                    </StyledAccordion>

                    <StyledAccordion
                        expanded={parametersExpanded}
                        onChange={(_, expanded) =>
                            setParametersExpanded(expanded)
                        }
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            slotProps={accordionSummarySlotProps(theme)}
                        >
                            <AccordionHeader>
                                <AccordionTitle>
                                    {isFlexibleRollout
                                        ? 'Rollout percentage'
                                        : strategyDefinition.displayName ||
                                          'Parameters'}
                                </AccordionTitle>
                                {isFlexibleRollout ? (
                                    <AccordionSubtitle>
                                        How much of that audience is exposed
                                    </AccordionSubtitle>
                                ) : null}
                            </AccordionHeader>
                            <StyledAccordionHint>
                                {rolloutHint}
                            </StyledAccordionHint>
                        </AccordionSummary>
                        <AccordionDetails
                            sx={isFlexibleRollout ? { padding: 0 } : undefined}
                        >
                            <FeatureStrategyType
                                strategy={strategy}
                                strategyDefinition={strategyDefinition}
                                updateParameter={updateParameter}
                                errors={errors}
                                groupIdTooltip={groupIdTooltip}
                            />
                        </AccordionDetails>
                    </StyledAccordion>

                    {showVariants && (
                        <StyledAccordion
                            expanded={variantsExpanded}
                            onChange={(_, expanded) =>
                                setVariantsExpanded(expanded)
                            }
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                slotProps={accordionSummarySlotProps(theme)}
                            >
                                <AccordionTitle>Variants</AccordionTitle>
                                <StyledAccordionHint>
                                    {strategy.variants?.length
                                        ? pluralize(
                                              strategy.variants.length,
                                              'variant',
                                          )
                                        : 'Same for everyone'}
                                </StyledAccordionHint>
                            </AccordionSummary>
                            <AccordionDetails>
                                <StrategyVariants
                                    strategy={strategy}
                                    setStrategy={setStrategy}
                                    failedVariantsSubmit={failedVariantsSubmit}
                                    clearFailedVariantsSubmit={
                                        clearFailedVariantsSubmit
                                    }
                                    canRenamePreexistingVariants={
                                        canRenamePreexistingVariants
                                    }
                                    payloadSchema={payloadSchema}
                                />
                            </AccordionDetails>
                        </StyledAccordion>
                    )}

                    {beforeFooter}
                </FormMainContent>
            </FormScrollArea>

            {isFlexibleRollout && (
                <PlainTextDescription
                    strategy={strategy}
                    environmentDisabledText={environmentDisabledText}
                />
            )}

            <FooterContent>
                {alertContent}
                <StyledButtons>{children}</StyledButtons>
            </FooterContent>
        </StyledForm>
    );
};
