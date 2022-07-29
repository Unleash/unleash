import { ConstraintIcon } from 'component/common/ConstraintAccordion/ConstraintIcon';
import { IConstraint } from 'interfaces/strategy';
import { ConstraintAccordionViewHeaderInfo } from './ConstraintAccordionViewHeaderInfo/ConstraintAccordionViewHeaderInfo';
import { ConstraintAccordionHeaderActions } from '../../ConstraintAccordionHeaderActions/ConstraintAccordionHeaderActions';
import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import {
    PlaygroundFeatureStrategyConstraintResult,
    SdkContextSchema,
} from '../../../../../hooks/api/actions/usePlayground/playground.model';

interface IConstraintAccordionViewHeaderProps {
    constraint: IConstraint | PlaygroundFeatureStrategyConstraintResult;
    onDelete?: () => void;
    onEdit?: () => void;
    singleValue: boolean;
    expanded: boolean;
    allowExpand: (shouldExpand: boolean) => void;
    playgroundContext?: SdkContextSchema;
    maxLength?: number;
}

export const ConstraintAccordionViewHeader = ({
    constraint,
    onEdit,
    onDelete,
    singleValue,
    allowExpand,
    expanded,
    maxLength,
    playgroundContext,
}: IConstraintAccordionViewHeaderProps) => {
    const { classes: styles } = useStyles();

    return (
        <div className={styles.headerContainer}>
            <ConstraintIcon />
            <ConstraintAccordionViewHeaderInfo
                constraint={constraint}
                singleValue={singleValue}
                allowExpand={allowExpand}
                expanded={expanded}
                result={'result' in constraint ? constraint.result : undefined}
                maxLength={maxLength}
                playgroundContext={playgroundContext}
            />
            <ConstraintAccordionHeaderActions
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
};
