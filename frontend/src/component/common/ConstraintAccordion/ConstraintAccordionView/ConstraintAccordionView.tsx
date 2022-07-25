import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
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
import { useState } from 'react';
interface IConstraintAccordionViewProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
}

export const ConstraintAccordionView = ({
    constraint,
    onEdit,
    onDelete,
}: IConstraintAccordionViewProps) => {
    const { classes: styles } = useStyles();
    const [expandable, setExpandable] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const singleValue = oneOf(
        [...semVerOperators, ...numOperators, ...dateOperators],
        constraint.operator
    );

    const handleClick = () => {
        console.log('click');
        if (expandable) {
            setExpanded(!expanded);
        }
    };

    return (
        <Accordion
            className={styles.accordion}
            classes={{ root: styles.accordionRoot }}
            expanded={expanded}
            sx={{ cursor: expandable ? 'pointer' : 'default' }}
        >
            <AccordionSummary
                className={styles.summary}
                expandIcon={null}
                onClick={handleClick}
            >
                <ConstraintAccordionViewHeader
                    constraint={constraint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    singleValue={singleValue}
                    allowExpand={setExpandable}
                    expanded={expanded}
                />
            </AccordionSummary>

            <AccordionDetails className={styles.accordionDetails}>
                <ConstraintAccordionViewBody constraint={constraint} />
            </AccordionDetails>
        </Accordion>
    );
};
