import { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    SxProps,
    Theme,
    styled,
} from '@mui/material';
import { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewBody } from './ConstraintAccordionViewBody/ConstraintAccordionViewBody';
import { ConstraintAccordionViewHeader } from './ConstraintAccordionViewHeader/ConstraintAccordionViewHeader';
import { oneOf } from 'utils/oneOf';
import {
    dateOperators,
    numOperators,
    semVerOperators,
} from 'constants/operators';

interface IConstraintAccordionViewProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    sx?: SxProps<Theme>;
    compact?: boolean;
    renderAfter?: JSX.Element;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    margin: 0,
    '&:before': {
        opacity: '0',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    '& .root': {
        border: 'none',
        padding: theme.spacing(0.5, 3),
        '&:hover .valuesExpandLabel': {
            textDecoration: 'underline',
        },
    },
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
    onEdit,
    onDelete,
    sx = undefined,
    compact = false,
    renderAfter,
}: IConstraintAccordionViewProps) => {
    const [expandable, setExpandable] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const singleValue = oneOf(
        [...semVerOperators, ...numOperators, ...dateOperators],
        constraint.operator
    );
    const handleClick = () => {
        if (expandable) {
            setExpanded(!expanded);
        }
    };

    return (
        <StyledAccordion expanded={expanded} sx={sx}>
            <StyledAccordionSummary
                expandIcon={null}
                onClick={handleClick}
                sx={{
                    cursor: expandable ? 'pointer' : 'default!important',
                    '&:hover': {
                        cursor: expandable ? 'pointer' : 'default!important',
                    },
                }}
            >
                <StyledWrapper>
                    <ConstraintAccordionViewHeader
                        constraint={constraint}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        singleValue={singleValue}
                        allowExpand={setExpandable}
                        expanded={expanded}
                        compact={compact}
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
