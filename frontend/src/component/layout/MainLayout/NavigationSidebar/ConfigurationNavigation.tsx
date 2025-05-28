import type React from 'react';
import type { FC } from 'react';
import type { NavigationMode } from './NavigationMode.ts';
import { Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AccordionHeader: FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='configure-content'
            id='configure-header'
        >
            <Typography sx={{ fontWeight: 'bold', fontSize: 'small' }}>
                {children}
            </Typography>
        </AccordionSummary>
    );
};

export const ConfigurationNavigation: FC<{
    expanded: boolean;
    onExpandChange: (expanded: boolean) => void;
    mode: NavigationMode;
    title: string;
    children?: React.ReactNode;
}> = ({ mode, expanded, onExpandChange, title, children }) => {
    return (
        <Accordion
            disableGutters={true}
            sx={{
                boxShadow: 'none',
                '&:before': {
                    display: 'none',
                },
            }}
            expanded={expanded}
            onChange={(_, expand) => {
                onExpandChange(expand);
            }}
        >
            {mode === 'full' && <AccordionHeader>{title}</AccordionHeader>}
            <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
        </Accordion>
    );
};
