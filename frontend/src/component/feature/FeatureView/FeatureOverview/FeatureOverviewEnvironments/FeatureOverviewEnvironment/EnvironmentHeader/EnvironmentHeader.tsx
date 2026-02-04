import { useMemo, type FC, type PropsWithChildren } from 'react';
import {
    AccordionSummary,
    type AccordionSummaryProps,
    styled,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Truncator } from 'component/common/Truncator/Truncator';
import { useId } from 'hooks/useId';
import { EnvironmentStrategySuggestion } from './EnvironmentStrategySuggestion/EnvironmentStrategySuggestion.js';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import { EnvironmentTemplateSuggestion } from './EnvironmentTemplateSuggestion/EnvironmentTemplateSuggestion';

const StyledAccordionSummary = styled(AccordionSummary, {
    shouldForwardProp: (prop) => prop !== 'expandable' && prop !== 'empty',
})<{
    expandable?: boolean;
    empty?: boolean;
}>(({ theme, expandable, empty }) => ({
    boxShadow: 'none',
    padding: theme.spacing(0.5, 3, 0.5, 2),
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadiusLarge,
    pointerEvents: 'auto',
    opacity: 1,
    '&&&': {
        cursor: expandable ? 'pointer' : 'default',
    },

    ':focus-within': {
        background: 'none',
    },
    ...(empty && {
        padding: 0,
        alignItems: 'normal',
        '.MuiAccordionSummary-content': {
            marginBottom: '0px',
            paddingBottom: '0px',
            flexDirection: 'column',
        },

        '.MuiAccordionSummary-expandIconWrapper': {
            width: '0px',
        },
    }),
}));

const StyledHeader = styled('header', {
    shouldForwardProp: (prop) => prop !== 'empty',
})<{
    empty?: boolean;
}>(({ theme, empty }) => ({
    display: 'flex',
    columnGap: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: '100%',
    color: theme.palette.text.primary,
    alignItems: 'center',
    minHeight: theme.spacing(8),
    ...(empty && {
        padding: theme.spacing(0, 8, 0, 2),
    }),
}));

const StyledHeaderTitle = styled('hgroup')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    flex: 1,
    columnGap: theme.spacing(1),
}));

const StyledHeaderTitleLabel = styled('p')(({ theme }) => ({
    width: '100%',
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledTruncator = styled(Truncator)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledStrategyCount = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.info.contrastText,
    backgroundColor: theme.palette.info.light,
    whiteSpace: 'nowrap',
    width: 'min-content',
    borderRadius: theme.shape.borderRadiusExtraLarge,
    padding: theme.spacing(0.5, 1),
}));

const NeutralStrategyCount = styled(StyledStrategyCount)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.neutral.light,
}));

type EnvironmentMetadata = {
    strategyCount: number;
    releasePlanCount: number;
};

type EnvironmentHeaderProps = {
    projectId: string;
    featureId: string;
    environmentId: string;
    expandable?: boolean;
    environmentMetadata?: EnvironmentMetadata;
    hasActivations?: boolean;
    onOpenReleaseTemplates?: any;
} & AccordionSummaryProps;

const MetadataChip = ({
    strategyCount,
    releasePlanCount,
}: EnvironmentMetadata) => {
    if (strategyCount === 0 && releasePlanCount === 0) {
        return <NeutralStrategyCount>0 strategies added</NeutralStrategyCount>;
    }

    const releasePlanText = releasePlanCount > 0 ? 'Release plan' : undefined;

    const strategyText = () => {
        switch (strategyCount) {
            case 0:
                return undefined;
            case 1:
                return `1 strategy`;
            default:
                return `${strategyCount} strategies`;
        }
    };

    const text = `${[releasePlanText, strategyText()].filter(Boolean).join(', ')} added`;

    return <StyledStrategyCount>{text}</StyledStrategyCount>;
};

const DEFAULT_STRATEGY: Omit<IFeatureStrategy, 'id'> = {
    name: 'flexibleRollout',
    disabled: false,
    constraints: [],
    title: '',
    parameters: {
        rollout: '100',
        stickiness: 'default',
        groupId: '',
    },
};

export const environmentAccordionSummaryClassName =
    'environment-accordion-summary';

export const EnvironmentHeader: FC<
    PropsWithChildren<EnvironmentHeaderProps>
> = ({
    projectId,
    featureId,
    environmentId,
    children,
    expandable = true,
    environmentMetadata,
    hasActivations = false,
    onOpenReleaseTemplates,
    ...props
}) => {
    const id = useId();
    const { environments } = useProjectEnvironments(projectId);
    const environment = environments.find((env) => env.name === environmentId);
    const defaultStrategy = environment?.defaultStrategy;
    const environmentType = environment?.type;

    const strategy: Omit<IFeatureStrategy, 'id'> = useMemo(() => {
        const baseDefaultStrategy = {
            ...DEFAULT_STRATEGY,
            ...defaultStrategy,
        };
        return {
            ...baseDefaultStrategy,
            disabled: false,
            constraints: baseDefaultStrategy.constraints ?? [],
            title: baseDefaultStrategy.title ?? '',
            parameters: baseDefaultStrategy.parameters ?? {},
        };
    }, [JSON.stringify(defaultStrategy)]);

    return (
        <StyledAccordionSummary
            {...props}
            expandIcon={
                <ExpandMore
                    sx={{ visibility: expandable ? 'visible' : 'hidden' }}
                />
            }
            id={id}
            aria-controls={`environment-accordion-${id}-content`}
            expandable={expandable}
            tabIndex={expandable ? 0 : -1}
            className={environmentAccordionSummaryClassName}
            empty={!hasActivations}
        >
            <StyledHeader empty={!hasActivations} data-loading>
                <StyledHeaderTitle>
                    <StyledHeaderTitleLabel>Environment</StyledHeaderTitleLabel>
                    <StyledTruncator component='h2'>
                        {environmentId}
                    </StyledTruncator>
                    {environmentMetadata ? (
                        <MetadataChip {...environmentMetadata} />
                    ) : null}
                </StyledHeaderTitle>
                {children}
            </StyledHeader>
            {!hasActivations && environmentType !== 'production' && (
                <EnvironmentStrategySuggestion
                    projectId={projectId}
                    featureId={featureId}
                    environmentId={environmentId}
                    strategy={strategy}
                />
            )}
            {!hasActivations &&
                environmentType === 'production' &&
                onOpenReleaseTemplates && (
                    <EnvironmentTemplateSuggestion
                        onClick={onOpenReleaseTemplates}
                    />
                )}
        </StyledAccordionSummary>
    );
};
