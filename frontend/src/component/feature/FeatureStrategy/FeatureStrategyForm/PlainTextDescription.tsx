import { useId, useMemo } from 'react';
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
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { formatConstraintText } from 'utils/formatConstraintText';
import { useLocationSettings } from 'hooks/useLocationSettings';

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
    const { segments: allSegments } = useSegments();
    const segmentsMap = useMemo(
        () =>
            new Map(allSegments?.map((segment) => [segment.id, segment.name])),
        [allSegments],
    );
    const { locationSettings } = useLocationSettings();

    if (!constraints?.length && !segments?.length)
        return <strong>everyone in production</strong>;

    const segmentText = !segments?.length
        ? 'users'
        : segments
              .map((segment) => segmentsMap.get(segment))
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
    // todo: figure out what to do here for non-rollout strategies.
    return `${strategy.parameters?.rollout ?? 100}%`;
};

const describeVariants = (strategy: StrategyFormState) => {
    // todo: figure out what to do here for non-rollout strategies.
    if (!strategy.variants?.length) return 'they all get the same experience.';

    if (strategy.variants?.length === 1)
        return (
            <>
                they all get <strong>{strategy.variants[0].name}</strong>.
            </>
        );

    return (
        <>
            they're split across{' '}
            <strong>{strategy.variants?.length} variants</strong>:
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
            <p {...props}>
                This strategy targets <strong>{targetingDescription}</strong>.
                Of them, <strong>{rolloutDescription}</strong> are exposed to
                the flag, and {variantDescription}
            </p>
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
