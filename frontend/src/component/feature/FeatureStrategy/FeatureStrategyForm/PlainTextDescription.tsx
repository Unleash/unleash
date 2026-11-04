import { type CSSProperties, useId } from 'react';
import {
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    accordionClasses,
    accordionSummaryClasses,
    alpha,
    Typography,
} from '@mui/material';
import type { IConstraint, StrategyFormState } from 'interfaces/strategy';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import { focusOutline } from 'themes/themeStyles';
import { useSegmentsMap } from 'hooks/api/getters/useSegments/useSegmentsMap.ts';
import {
    constraintTextParts,
    formatConstraintText,
} from 'utils/formatConstraintText';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { calculateVariantWeight } from 'component/common/util';
import type { StrategyVariantSchema } from 'openapi';
import {
    fitContainerHeightSelector,
    formTemplatePinnedFooterMediaQuery,
} from 'component/common/FormTemplate/FormTemplate.styles';
import { constraintId } from 'constants/constraintId';

const SummaryIcon = styled(ModeCommentOutlinedIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    transform: 'rotateY(180deg)',
}));

const PlainTextAccordion = styled(Accordion)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.primary.containerBorder}`,
    paddingBlock: theme.spacing(0.75),
    backgroundColor: theme.palette.primary.container,
    boxShadow: 'none',
    '::before': { display: 'none' },
    '&:first-of-type, &:last-of-type': {
        // override the global theme override that rounds borders on accordions
        borderRadius: 0,
    },
    [`& .${accordionClasses.region}`]: {
        [`${fitContainerHeightSelector} &`]: {
            [formTemplatePinnedFooterMediaQuery]: {
                maxHeight: '25vh',
                overflowY: 'auto',
            },
        },
        '&:focus-visible': {
            ...focusOutline(theme),
            outlineOffset: -2,
        },
    },
}));

const Summary = styled(AccordionSummary)(({ theme }) => ({
    color: theme.palette.primary.onContainer,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.caption.fontSize,
    paddingInline: 'var(--form-inset)',
    minHeight: 0,
    [`& .${accordionSummaryClasses.content}`]: {
        gap: theme.spacing(1),
        alignItems: 'center',
    },
    [`&.${accordionSummaryClasses.focusVisible}`]: {
        outline: 'none',
        backgroundColor: 'transparent',
    },
}));

const Details = styled(AccordionDetails)({
    paddingTop: 0,
    paddingInline: 'var(--form-inset)',
});

const SummaryText = styled('span')({
    textTransform: 'uppercase',
    letterSpacing: '0.84px',
});

const ShowHideText = styled(({ className }: { className?: string }) => (
    <span aria-hidden className={className}>
        <span className='show'>Show</span>
        <span className='hide'>Hide</span>
    </span>
))(({ theme }) => ({
    marginLeft: 'auto',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    fontSize: theme.typography.body2.fontSize,

    // only show the correct value, but render both to reserve space.
    display: 'inline-grid',
    '& > *': {
        gridArea: '1 / 1',
        textAlign: 'center',
    },
    '[aria-expanded="true"] & .show, [aria-expanded="false"] & .hide': {
        visibility: 'hidden',
    },

    // look like a button-ish
    paddingInline: theme.spacing(1.5),
    paddingBlock: theme.spacing(0.75),
    borderRadius: theme.shape.borderRadius,
    [`.${accordionSummaryClasses.root}:is(.${accordionSummaryClasses.focusVisible}, :hover) &`]:
        {
            backgroundColor: alpha(
                theme.palette.primary.main,
                theme.palette.action.hoverOpacity,
            ),
        },
    [`.${accordionSummaryClasses.focusVisible} &`]: focusOutline(theme),
}));

const isConstraintWithValue = (constraint: IConstraint) =>
    constraint.values?.length || constraint.value;

const useTargetingDescription = ({
    constraints,
    segments,
}: Pick<StrategyFormState, 'constraints' | 'segments'>) => {
    const segmentsMap = useSegmentsMap();
    const { locationSettings } = useLocationSettings();

    if (!constraints?.length && !segments?.length)
        return 'everyone in production';

    const segmentText = !segments?.length
        ? 'users'
        : segments
              .map((segment) => segmentsMap.get(segment)?.name)
              .filter(Boolean)
              .join(' + ');

    const describeConstraint = (constraint: IConstraint) =>
        `whose ${formatConstraintText(constraint, locationSettings)}`;

    const constraintText = constraints
        ?.filter(isConstraintWithValue)
        .map(describeConstraint)
        .join(', and ');

    return `${segmentText} ${constraintText}`.trim();
};

const describeRollout = (strategy: StrategyFormState) => {
    return `${strategy.parameters?.rollout ?? 100}%`;
};

const FormattedRuleValues = ({ values }: { values: string[] }) => {
    const namedValues = values.slice(0, 3).join(', ');

    const remainingValues = values.length - 3;

    const remainingText =
        remainingValues > 0 ? (
            <Typography component='span' color='textSecondary'>
                +{remainingValues} more
            </Typography>
        ) : null;

    return (
        <>
            <strong>{namedValues}</strong> {remainingText}
        </>
    );
};

const SegmentRow = ({ segments }: { segments?: number[] }) => {
    const segmentsMap = useSegmentsMap();
    if (!segments || segments.length === 0) return null;

    const segmentNames = segments
        .map((segment) => segmentsMap.get(segment)?.name)
        .filter((name) => name !== undefined);

    return (
        <li>
            the user is part of <FormattedRuleValues values={segmentNames} />
        </li>
    );
};

const RuleList = styled(
    ({
        strategy,
        ...props
    }: {
        strategy: StrategyFormState;
        className?: string;
    }) => {
        const { locationSettings } = useLocationSettings();
        const ruleCount =
            (strategy.segments?.length ? 1 : 0) +
            (strategy.constraints?.length ?? 0);
        return (
            <ol
                style={
                    {
                        '--marker-width': `${String(ruleCount).length}ch`,
                    } as CSSProperties
                }
                {...props}
            >
                <SegmentRow segments={strategy.segments} />
                {strategy.constraints
                    ?.filter(isConstraintWithValue)
                    .map((constraint, index) => {
                        const { contextName, operatorText, values } =
                            constraintTextParts(constraint, locationSettings);

                        return (
                            <li key={constraint[constraintId] || index}>
                                <strong>{contextName}</strong> {operatorText}{' '}
                                <FormattedRuleValues values={values} />
                            </li>
                        );
                    })}
            </ol>
        );
    },
)(({ theme }) => ({
    '@counter-style rule-number': {
        system: 'extends decimal',
        suffix: '""',
    },
    '--separator': `1px solid ${theme.palette.divider}`,
    listStyle: 'rule-number',
    paddingInlineStart: 'var(--marker-width)',
    borderBlockEnd: `var(--separator)`,
    '& > li': {
        position: 'relative',
        paddingInlineStart: theme.spacing(3),
        paddingBlock: theme.spacing(1),
    },
    '& > li::before': {
        content: '""',
        position: 'absolute',
        insetBlockStart: 0,
        insetInline: 'calc(-1 * var(--marker-width)) 0',
        borderBlockStart: `var(--separator)`,
    },
    '& > li::marker': {
        fontVariantNumeric: 'tabular-nums',
        color: theme.palette.primary.onContainer,
    },
}));

const variantDisplayName = (variant: StrategyVariantSchema) =>
    variant.name || 'unnamed variant';

const PayloadInfo = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    '::before': {
        content: '" — "',
    },
}));

const VariantList = styled(
    ({
        variants,
        ...props
    }: {
        variants?: StrategyVariantSchema[];
        className?: string;
    }) => (
        <ul
            // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics when list-style is none: https://bugs.webkit.org/show_bug.cgi?id=170179
            role='list'
            {...props}
        >
            {variants?.map((variant, index) => (
                <li key={index}>
                    <strong>{calculateVariantWeight(variant.weight)}%</strong>{' '}
                    get <strong>{variantDisplayName(variant)}</strong>
                    <PayloadInfo>
                        {variant.payload
                            ? `${variant.payload.type} payload`
                            : 'no payload set'}
                    </PayloadInfo>
                </li>
            ))}
        </ul>
    ),
)(({ theme }) => {
    const colors = theme.palette.variants;
    const markerColors = Object.fromEntries(
        colors.map((color, i) => [
            `& > li:nth-of-type(${colors.length}n + ${i + 1})`,
            { '--variant-color': color },
        ]),
    );
    const markerSize = theme.spacing(1);
    const markerGap = theme.spacing(1);
    return {
        ':empty': { display: 'none' },
        '--left-padding': `calc(${markerSize} + ${markerGap})`,
        paddingInlineStart: 'var(--left-padding)',
        listStyle: 'none',
        'li + li': {
            marginBlockStart: theme.spacing(1.5),
        },
        '& > li::before': {
            content: '""',
            display: 'inline-block',
            width: markerSize,
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            marginRight: markerGap,
            marginLeft: `calc(-1 * var(--left-padding))`,
            backgroundColor: 'var(--variant-color)',
            border: `1px solid ${theme.palette.text.secondary}`,
            boxSizing: 'content-box', // avoid border overflowing container
        },
        ...markerColors,
    };
});

const describeVariants = (strategy: StrategyFormState) => {
    if (!strategy.variants?.length) return 'they all get the same experience.';
    if (strategy.variants.length === 1)
        return (
            <>
                they all get{' '}
                <strong>{variantDisplayName(strategy.variants[0])}</strong>.
            </>
        );

    return (
        <>
            they're split across{' '}
            <strong>{strategy.variants.length} variants</strong>:
        </>
    );
};

const StrategyDescriptionText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.6,
}));

const SimpleStrategyDescription = ({
    strategy,
}: {
    strategy: StrategyFormState;
}) => {
    const targetingDescription = useTargetingDescription(strategy);
    const rolloutDescription = describeRollout(strategy);
    const variantDescription = describeVariants(strategy);
    return (
        <>
            <StrategyDescriptionText>
                This strategy targets <strong>{targetingDescription}</strong>.
                Of them, <strong>{rolloutDescription}</strong> are exposed to
                the flag, and {variantDescription}
            </StrategyDescriptionText>
            <VariantList variants={strategy.variants} />
        </>
    );
};

const ComplexStrategyDescription = ({
    strategy,
    totalRules,
}: {
    strategy: StrategyFormState;
    totalRules: number;
}) => {
    const rolloutDescription = describeRollout(strategy);
    const variantDescription = describeVariants(strategy);
    return (
        <>
            <StrategyDescriptionText>
                <strong>{rolloutDescription}</strong> of users who match{' '}
                <strong>all {totalRules} rules</strong> are exposed to the flag,
                and {variantDescription}
            </StrategyDescriptionText>
            <RuleList strategy={strategy} />
            <VariantList variants={strategy.variants} />
        </>
    );
};

const StrategyDescription = ({ strategy }: { strategy: StrategyFormState }) => {
    const totalRules =
        (strategy.segments?.length ?? 0) + (strategy.constraints?.length ?? 0);
    if (totalRules < 5) {
        return <SimpleStrategyDescription strategy={strategy} />;
    } else {
        return (
            <ComplexStrategyDescription
                strategy={strategy}
                totalRules={totalRules}
            />
        );
    }
};
export const PlainTextDescription = ({
    strategy,
}: {
    strategy: StrategyFormState;
}) => {
    const headerId = useId();
    const contentId = useId();
    return (
        <PlainTextAccordion
            disableGutters
            slotProps={{ region: { tabIndex: 0 } }}
        >
            <Summary id={headerId} aria-controls={contentId}>
                <SummaryIcon fontSize='small' />
                <SummaryText>In plain text</SummaryText>
                <ShowHideText />
            </Summary>
            <Details>
                <StrategyDescription strategy={strategy} />
            </Details>
        </PlainTextAccordion>
    );
};
