import { useId } from 'react';
import {
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    accordionSummaryClasses,
    alpha,
} from '@mui/material';
import type { IConstraint, StrategyFormState } from 'interfaces/strategy';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import { focusOutline } from 'themes/themeStyles';
import { useSegmentsMap } from 'hooks/api/getters/useSegments/useSegmentsMap.ts';
import { formatConstraintText } from 'utils/formatConstraintText';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { calculateVariantWeight } from 'component/common/util';
import type { IFeatureVariant } from 'interfaces/featureToggle';

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

const useTargetingDescription = ({
    constraints,
    segments,
}: Pick<StrategyFormState, 'constraints' | 'segments'>) => {
    const segmentsMap = useSegmentsMap();
    const { locationSettings } = useLocationSettings();

    if (!constraints?.length && !segments?.length)
        return <strong>everyone in production</strong>;

    const segmentText = !segments?.length
        ? 'users'
        : segments
              .map((segment) => segmentsMap.get(segment)?.name)
              .filter(Boolean)
              .join(' + ');

    const describeConstraint = (constraint: IConstraint) =>
        `whose ${formatConstraintText(constraint, locationSettings)}`;

    const constraintText = constraints
        ?.filter((constraint) => constraint.values?.length || constraint.value)
        .map(describeConstraint)
        .join(', and ');
    return (
        <strong>
            {segmentText} {constraintText}
        </strong>
    );
};

const describeRollout = (strategy: StrategyFormState) => {
    return `${strategy.parameters?.rollout ?? 100}%`;
};

const variantDisplayName = (variant: IFeatureVariant) =>
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
        variants?: IFeatureVariant[];
        className?: string;
    }) => (
        <ul
            // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics when list-style is none: https://bugs.webkit.org/show_bug.cgi?id=170179
            role='list'
            {...props}
        >
            {variants?.map((variant) => (
                <li key={variant.name}>
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

const StrategyDescription = styled(
    ({
        strategy,
        ...props
    }: {
        strategy: StrategyFormState;
        className?: string;
    }) => {
        const targetingDescription = useTargetingDescription(strategy);
        const rolloutDescription = describeRollout(strategy);
        const variantDescription = describeVariants(strategy);
        return (
            <>
                <p {...props}>
                    This strategy targets{' '}
                    <strong>{targetingDescription}</strong>. Of them,{' '}
                    <strong>{rolloutDescription}</strong> are exposed to the
                    flag, and {variantDescription}
                </p>
                <VariantList variants={strategy.variants} />
            </>
        );
    },
)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 1.6,
}));

export const PlainTextDescription = ({
    strategy,
}: {
    strategy: StrategyFormState;
}) => {
    const headerId = useId();
    const contentId = useId();
    return (
        <PlainTextAccordion disableGutters>
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
