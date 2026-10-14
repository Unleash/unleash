import { useId } from 'react';
import {
    styled,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    accordionSummaryClasses,
} from '@mui/material';
import type { StrategyFormState } from 'interfaces/strategy';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';

const SummaryIcon = styled(ModeCommentOutlinedIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
    transform: 'rotateY(180deg)',
}));

const PlainTextAccordion = styled(Accordion)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.primary.containerBorder}`,
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
    paddingInline: 'var(--form-inset)',
    minHeight: 0,
    [`& .${accordionSummaryClasses.content}`]: {
        gap: theme.spacing(1),
    },
}));

const Details = styled(AccordionDetails)({
    paddingInline: 'var(--form-inset)',
});

const SummaryText = styled('span')(({ theme }) => ({
    textTransform: 'uppercase',
    letterSpacing: '0.84px',
    fontSize: theme.typography.body1.fontSize,
}));

const ShowHideText = styled(({ className }: { className?: string }) => (
    <span aria-hidden className={className}>
        <span className='show'>Show</span>
        <span className='hide'>Hide</span>
    </span>
))(({ theme }) => ({
    marginLeft: 'auto',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    paddingInline: theme.spacing(1),

    '[aria-expanded="true"] & .show, [aria-expanded="false"] & .hide': {
        display: 'none',
    },
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
