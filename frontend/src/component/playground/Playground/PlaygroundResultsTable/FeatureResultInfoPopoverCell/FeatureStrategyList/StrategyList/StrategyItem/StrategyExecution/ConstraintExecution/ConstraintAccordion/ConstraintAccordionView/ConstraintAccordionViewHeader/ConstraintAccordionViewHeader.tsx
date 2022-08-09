import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo/ConstraintAccordionViewHeaderInfo';
import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';

interface PlaygroundConstraintAccordionViewHeaderProps {
    constraint: PlaygroundConstraintSchema;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    playgroundInput?: PlaygroundRequestSchema;
    maxLength?: number;
}

export const ConstraintAccordionViewHeader = ({
    constraint,
    singleValue,
    allowExpand,
    expanded,
    maxLength,
    playgroundInput,
}: PlaygroundConstraintAccordionViewHeaderProps) => {
    const { classes: styles } = useStyles();

    return (
        <div className={styles.headerContainer}>
            <ConstraintIcon />
            <ConstraintAccordionViewHeaderInfo
                constraint={constraint}
                singleValue={singleValue}
                allowExpand={allowExpand}
                expanded={expanded}
                result={constraint.result}
                maxLength={maxLength}
                playgroundInput={playgroundInput}
            />
        </div>
    );
};
