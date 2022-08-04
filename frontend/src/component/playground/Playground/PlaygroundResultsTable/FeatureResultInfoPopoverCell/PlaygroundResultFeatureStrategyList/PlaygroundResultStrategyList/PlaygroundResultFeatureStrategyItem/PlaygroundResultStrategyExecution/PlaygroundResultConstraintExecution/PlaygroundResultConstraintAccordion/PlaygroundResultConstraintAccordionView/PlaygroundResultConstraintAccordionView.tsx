import { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    SxProps,
    Theme,
    useTheme,
} from '@mui/material';
import { PlaygroundConstraintAccordionViewHeader } from './PlaygroundConstraintAccordionViewHeader/PlaygroundConstraintAccordionViewHeader';
import { oneOf } from 'utils/oneOf';
import {
    dateOperators,
    numOperators,
    semVerOperators,
} from 'constants/operators';
import { useStyles } from './PlaygroundConstraintAccordion.styles';
import {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import { ConstraintAccordionViewBody } from 'component/common/ConstraintAccordion/ConstraintAccordionView/ConstraintAccordionViewBody/ConstraintAccordionViewBody';

interface IConstraintAccordionViewProps {
    constraint: PlaygroundConstraintSchema;
    playgroundInput?: PlaygroundRequestSchema;
    maxLength?: number;
    sx?: SxProps<Theme>;
}

export const PlaygroundResultConstraintAccordionView = ({
    constraint,
    sx = undefined,
    maxLength,
    playgroundInput,
}: IConstraintAccordionViewProps) => {
    const { classes: styles } = useStyles();
    const [expandable, setExpandable] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();

    const singleValue = oneOf(
        [...semVerOperators, ...numOperators, ...dateOperators],
        constraint.operator
    );
    const handleClick = () => {
        if (expandable) {
            setExpanded(!expanded);
        }
    };
    const backgroundColor = Boolean(playgroundInput)
        ? !Boolean((constraint as PlaygroundConstraintSchema).result)
            ? theme.palette.neutral.light
            : 'inherit'
        : 'inherit';

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
                    backgroundColor: backgroundColor,
                }}
            >
                <PlaygroundConstraintAccordionViewHeader
                    constraint={constraint}
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
