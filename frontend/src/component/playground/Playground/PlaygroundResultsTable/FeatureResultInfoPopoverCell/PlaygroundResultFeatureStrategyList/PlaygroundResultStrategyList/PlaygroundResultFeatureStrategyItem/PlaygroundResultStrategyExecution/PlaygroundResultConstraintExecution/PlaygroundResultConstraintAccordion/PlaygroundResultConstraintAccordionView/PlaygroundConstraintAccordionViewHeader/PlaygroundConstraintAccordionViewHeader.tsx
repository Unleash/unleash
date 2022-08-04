import {ConstraintIcon} from 'component/common/ConstraintAccordion/ConstraintIcon';
import {
    PlaygroundConstraintAccordionViewHeaderInfo
} from './PlaygroundConstraintAccordionViewHeaderInfo/PlaygroundConstraintAccordionViewHeaderInfo';
import {useStyles} from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import {PlaygroundConstraintSchema, PlaygroundRequestSchema,} from 'hooks/api/actions/usePlayground/playground.model';

interface PlaygroundConstraintAccordionViewHeaderProps {
    constraint: PlaygroundConstraintSchema;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    playgroundInput?: PlaygroundRequestSchema;
    maxLength?: number;
}

export const PlaygroundConstraintAccordionViewHeader = ({
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
            <PlaygroundConstraintAccordionViewHeaderInfo
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
