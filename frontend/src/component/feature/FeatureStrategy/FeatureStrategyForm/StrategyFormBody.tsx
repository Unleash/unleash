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
} from '@mui/material';
import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import produce from 'immer';
import { FeatureStrategyType } from '../FeatureStrategyType/FeatureStrategyType.tsx';
import type { IFormErrors } from 'hooks/useFormErrors';
import { FeatureStrategyTitle } from './FeatureStrategyTitle/FeatureStrategyTitle.tsx';
import { FeatureStrategyEnabledDisabled } from './FeatureStrategyEnabledDisabled/FeatureStrategyEnabledDisabled.tsx';
import {
    FeatureStrategyTargetAudience,
    type TargetAudience,
} from './FeatureStrategyTargetAudience/FeatureStrategyTargetAudience.tsx';
import { formatStrategyName } from 'utils/strategyNames';
import { StrategyVariants } from 'component/feature/StrategyTypes/StrategyVariants';
import type { ParametersSchema } from 'openapi/index.ts';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { parseParameterNumber } from 'utils/parseParameter.ts';
import { PlainTextDescription } from './PlainTextDescription.tsx';

export interface StrategyFormBodyProps<T extends StrategyFormState> {
    strategy: T;
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    strategyDefinition: IStrategy;
    errors: IFormErrors;

    validateParameter?: (name: string, value: ParametersSchema[string]) => void;
    canRenamePreexistingVariants?: boolean;

    alertContent?: React.ReactNode;
    allowEnableDisable?: boolean;
    statusContent?: React.ReactNode;
    beforeFooter?: React.ReactNode;
    groupIdTooltip?: React.ReactNode;
    children?: React.ReactNode;

    onSubmit: (event: React.FormEvent) => void;
}

const StyledHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(2),
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    ...theme.typography.h1,
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
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

const StyledAccordionHeading = styled('h2')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
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
    position: 'relative',
    paddingTop: theme.spacing(4),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
}));

const FormMainContent = styled('div')(({ theme }) => ({
    flex: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingInline: 'var(--form-inset)',
}));

const FormFooter = styled('div')({
    position: 'sticky',
    bottom: 0,
});

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingInline: 'var(--form-inset)',
    backgroundColor: theme.palette.background.paper,
    justifyContent: 'end',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export const StrategyFormBody = <T extends StrategyFormState>({
    strategy,
    setStrategy,
    strategyDefinition,
    errors,
    validateParameter,
    canRenamePreexistingVariants,
    alertContent,
    allowEnableDisable,
    statusContent,
    beforeFooter,
    groupIdTooltip,
    children,
    onSubmit,
}: StrategyFormBodyProps<T>) => {
    const theme = useTheme();
    const strategyName = strategy?.name || strategy?.strategyName;

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

    const handleTitleChange = (title: string) => {
        setStrategy((prev) => ({
            ...prev,
            title,
        }));
    };

    return (
        <>
            <StyledHeaderBox>
                <StyledTitle>
                    {formatStrategyName(strategyName || '')}
                </StyledTitle>
            </StyledHeaderBox>

            {alertContent}

            <StyledForm
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSubmit(e);
                }}
            >
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
                            <StyledAccordionHeading>
                                Target audience
                            </StyledAccordionHeading>
                            <StyledAccordionHint>
                                {targetAudience === 'everyone'
                                    ? 'Everyone in production'
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

                    <StyledAccordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            slotProps={accordionSummarySlotProps(theme)}
                        >
                            <StyledAccordionHeading>
                                {isFlexibleRollout
                                    ? 'Rollout percentage'
                                    : strategyDefinition.displayName}
                            </StyledAccordionHeading>
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
                        <StyledAccordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                slotProps={accordionSummarySlotProps(theme)}
                            >
                                <StyledAccordionHeading>
                                    Variants
                                </StyledAccordionHeading>
                                <StyledAccordionHint>
                                    {strategy.variants?.length ? (
                                        <>{strategy.variants.length} variants</>
                                    ) : (
                                        'Same for everyone'
                                    )}
                                </StyledAccordionHint>
                            </AccordionSummary>
                            <AccordionDetails>
                                <StrategyVariants
                                    strategy={strategy}
                                    setStrategy={setStrategy}
                                    canRenamePreexistingVariants={
                                        canRenamePreexistingVariants
                                    }
                                />
                            </AccordionDetails>
                        </StyledAccordion>
                    )}

                    {allowEnableDisable ? (
                        <FeatureStrategyEnabledDisabled
                            enabled={!strategy?.disabled}
                            onToggleEnabled={() =>
                                setStrategy((strategyState) => ({
                                    ...strategyState,
                                    disabled: !strategyState.disabled,
                                }))
                            }
                        />
                    ) : null}

                    {statusContent}
                    {beforeFooter}
                </FormMainContent>

                <FormFooter>
                    <PlainTextDescription strategy={strategy} />

                    <StyledButtons>{children}</StyledButtons>
                </FormFooter>
            </StyledForm>
        </>
    );
};
