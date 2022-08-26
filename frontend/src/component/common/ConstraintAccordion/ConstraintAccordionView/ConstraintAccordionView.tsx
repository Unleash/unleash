import { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    SxProps,
    Theme,
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
import { useStyles } from '../ConstraintAccordion.styles';

interface IConstraintAccordionViewProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    sx?: SxProps<Theme>;
    compact?: boolean;
    renderAfter?: JSX.Element;
}

export const ConstraintAccordionView = ({
    constraint,
    onEdit,
    onDelete,
    sx = undefined,
    compact = false,
    renderAfter,
}: IConstraintAccordionViewProps) => {
    const { classes: styles } = useStyles();
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
        <Accordion
            className={styles.accordion}
            classes={{ root: styles.accordionRoot }}
            expanded={expanded}
            sx={sx}
        >
            <AccordionSummary
                classes={{ root: styles.summary }}
                expandIcon={null}
                onClick={handleClick}
                sx={{
                    cursor: expandable ? 'pointer' : 'default!important',
                    '&:hover': {
                        cursor: expandable ? 'pointer' : 'default!important',
                    },
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                    }}
                >
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
                </div>
            </AccordionSummary>

            <AccordionDetails className={styles.accordionDetails}>
                <ConstraintAccordionViewBody constraint={constraint} />
            </AccordionDetails>
        </Accordion>
    );
};
