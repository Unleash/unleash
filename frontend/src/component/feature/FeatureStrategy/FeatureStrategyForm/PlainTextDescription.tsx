import { useId } from 'react';
import {
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    accordionSummaryClasses,
    alpha,
} from '@mui/material';
import type { StrategyFormState } from 'interfaces/strategy';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import { focusOutline } from 'themes/themeStyles';

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
            <Details>{JSON.stringify(strategy)}</Details>
        </PlainTextAccordion>
    );
};
