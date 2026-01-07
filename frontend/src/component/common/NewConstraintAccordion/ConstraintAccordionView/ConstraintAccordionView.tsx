import { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    type SxProps,
    type Theme,
    styled,
} from '@mui/material';
import type { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewBody } from './ConstraintAccordionViewBody/ConstraintAccordionViewBody.tsx';
import { ConstraintAccordionViewHeader } from './ConstraintAccordionViewHeader/ConstraintAccordionViewHeader.tsx';

interface IConstraintAccordionViewProps {
    constraint: IConstraint;
    onUse?: () => void;
    sx?: SxProps<Theme>;
    disabled?: boolean;
    renderAfter?: JSX.Element;
    borderStyle?: 'solid' | 'dashed';
}

interface StyledAccordionProps {
    borderStyle?: 'solid' | 'dashed';
}

const StyledAccordion = styled(Accordion, {
    shouldForwardProp: (prop) => prop !== 'borderStyle',
})<StyledAccordionProps>(({ theme, borderStyle = 'solid' }) => ({
    border: `1px ${borderStyle} ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    boxShadow: 'none',
    margin: 0,
    '&:before': {
        opacity: '0',
    },
    overflow: 'hidden',
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    '& .root': {
        border: 'none',
        padding: theme.spacing(0.5, 3),
        '&:hover .valuesExpandLabel': {
            textDecoration: 'underline',
        },
    },
    userSelect: 'auto',
    WebkitUserSelect: 'auto',
    MozUserSelect: 'auto',
    MsUserSelect: 'auto',
}));
const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    borderTop: `1px dashed ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
}));

const StyledWrapper = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
});

export const ConstraintAccordionView = ({
    constraint,
    onUse,
    sx = undefined,
    disabled = false,
    renderAfter,
    borderStyle = 'solid',
}: IConstraintAccordionViewProps) => {
    const [expandable, setExpandable] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const handleClick = () => {
        if (expandable) {
            setExpanded(!expanded);
        }
    };

    return (
        <StyledAccordion expanded={expanded} sx={sx} borderStyle={borderStyle}>
            <StyledAccordionSummary
                expandIcon={null}
                onClick={handleClick}
                sx={{
                    cursor: expandable ? 'pointer' : 'default!important',
                    '&:hover': {
                        cursor: expandable ? 'pointer' : 'default!important',
                    },
                }}
                tabIndex={expandable ? 0 : -1}
            >
                <StyledWrapper>
                    <ConstraintAccordionViewHeader
                        constraint={constraint}
                        onUse={onUse}
                        allowExpand={setExpandable}
                        disabled={disabled}
                        expanded={expanded}
                    />
                    {renderAfter}
                </StyledWrapper>
            </StyledAccordionSummary>

            <StyledAccordionDetails>
                <ConstraintAccordionViewBody constraint={constraint} />
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
