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
import {
    PlaygroundFeatureStrategyConstraintResult,
    PlaygroundRequestSchema,
} from '../../../../hooks/api/actions/usePlayground/playground.model';

interface IConstraintAccordionViewProps {
    constraint: IConstraint | PlaygroundFeatureStrategyConstraintResult;
    onDelete?: () => void;
    onEdit?: () => void;
    playgroundInput?: PlaygroundRequestSchema;
    maxLength?: number;
    sx?: SxProps<Theme>;
}

export const ConstraintAccordionView = ({
    constraint,
    onEdit,
    onDelete,
    sx = undefined,
    maxLength,
    playgroundInput,
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
                <ConstraintAccordionViewHeader
                    constraint={constraint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    singleValue={singleValue}
                    allowExpand={setExpandable}
                    expanded={expanded}
                    maxLength={maxLength ?? 112}
                    playgroundInput={playgroundInput}
                />
            </AccordionSummary>

            <AccordionDetails className={styles.accordionDetails}>
                <ConstraintAccordionViewBody constraint={constraint} />
            </AccordionDetails>
        </Accordion>
    );
};
