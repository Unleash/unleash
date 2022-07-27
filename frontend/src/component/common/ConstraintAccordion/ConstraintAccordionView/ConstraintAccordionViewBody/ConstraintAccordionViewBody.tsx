import { IConstraint } from 'interfaces/strategy';
import { useStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { MultipleValues } from './MultipleValues/MultipleValues';
import { SingleValue } from './SingleValue/SingleValue';

interface IConstraintAccordionViewBodyProps {
    constraint: IConstraint;
}

export const ConstraintAccordionViewBody = ({
    constraint,
}: IConstraintAccordionViewBodyProps) => {
    const { classes: styles } = useStyles();
    const { locationSettings } = useLocationSettings();

    return (
        <div>
            <div className={styles.valuesContainer}>
                <MultipleValues values={constraint.values} />
                <SingleValue
                    value={formatConstraintValue(constraint, locationSettings)}
                    operator={constraint.operator}
                />
            </div>
        </div>
    );
};
