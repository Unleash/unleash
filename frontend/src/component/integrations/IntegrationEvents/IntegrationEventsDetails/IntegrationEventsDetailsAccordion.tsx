import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    styled,
} from '@mui/material';
import type { ReactNode } from 'react';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    '&:before': {
        display: 'none',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)({
    lineHeight: '1.5rem',
});

interface IIntegrationEventsDetailsEventProps {
    header: ReactNode;
    children: ReactNode;
}

export const IntegrationEventsDetailsAccordion = ({
    header,
    children,
}: IIntegrationEventsDetailsEventProps) => (
    <StyledAccordion>
        <StyledAccordionSummary
            expandIcon={
                // biome-ignore lint/a11y/useValidAriaRole: remove button role - accordion already has it
                <IconButton component='span' tabIndex={-1} role={undefined}>
                    <ExpandMore titleAccess='Toggle' />
                </IconButton>
            }
        >
            {header}
        </StyledAccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
    </StyledAccordion>
);
