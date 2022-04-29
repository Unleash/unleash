import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
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
    compact: boolean;
}

export const ConstraintAccordionView = ({
    compact,
    constraint,
    onEdit,
    onDelete,
}: IConstraintAccordionViewProps) => {
    const styles = useStyles();

    const singleValue = oneOf(
        [...semVerOperators, ...numOperators, ...dateOperators],
        constraint.operator
    );

    return (
        <Accordion
            className={styles.accordion}
            classes={{ root: styles.accordionRoot }}
        >
            <AccordionSummary
                className={styles.summary}
                expandIcon={<ExpandMore titleAccess="Toggle" />}
            >
                <ConstraintAccordionViewHeader
                    compact={compact}
                    constraint={constraint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    singleValue={singleValue}
                />
            </AccordionSummary>

            <AccordionDetails className={styles.accordionDetails}>
                <ConstraintAccordionViewBody constraint={constraint} />
            </AccordionDetails>
        </Accordion>
    );
};
