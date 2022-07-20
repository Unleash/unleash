import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
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
import {useState} from "react";
interface IConstraintAccordionViewProps {
    constraint: IConstraint;
    onDelete?: () => void;
    onEdit?: () => void;
    compact: boolean;
}

export const ConstraintAccordionView = ({
    compact,
    constraint,
    onEdit,
    onDelete,
}: IConstraintAccordionViewProps) => {
    const { classes: styles } = useStyles();
    const [expandable, setExpandable] = useState(true)
    const [expanded, setExpanded] = useState(false);

    const singleValue = oneOf(
        [...semVerOperators, ...numOperators, ...dateOperators],
        constraint.operator
    );

    const handleChange =
        () => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded((!isExpanded && expandable));
        };

    return (
        <Accordion
            className={styles.accordion}
            classes={{ root: styles.accordionRoot }}
            expanded={expanded}
            onChange={handleChange}
        >
            <AccordionSummary className={styles.summary} expandIcon={null}>
                <ConstraintAccordionViewHeader
                    compact={compact}
                    constraint={constraint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    singleValue={singleValue}
                    allowExpand={(shouldExpand) => setExpandable(shouldExpand)}
                />
            </AccordionSummary>

            <AccordionDetails className={styles.accordionDetails}>
                <ConstraintAccordionViewBody constraint={constraint} />
            </AccordionDetails>
        </Accordion>
    );
};
