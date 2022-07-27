import { ImportExportOutlined, TextFormatOutlined } from '@mui/icons-material';
import { stringOperators } from 'constants/operators';
import { IConstraint } from 'interfaces/strategy';
import { oneOf } from 'utils/oneOf';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useStyles as useAccordionStyles } from 'component/common/ConstraintAccordion/ConstraintAccordion.styles';
import { useStyles } from './ConstraintAccordionViewBody.style';
import { MultipleValues } from './MultipleValues/MultipleValues';
import { SingleValue } from './SingleValue/SingleValue';

interface IConstraintAccordionViewBodyProps {
    constraint: IConstraint;
}

export const ConstraintAccordionViewBody = ({
    constraint,
}: IConstraintAccordionViewBodyProps) => {
    const { classes: styles } = useAccordionStyles();
    const { classes } = useStyles();
    const { locationSettings } = useLocationSettings();

    return (
        <div>
            <ConditionallyRender
                condition={
                    oneOf(stringOperators, constraint.operator) &&
                    Boolean(constraint.caseInsensitive)
                }
                show={
                    <p className={classes.settingsParagraph}>
                        <TextFormatOutlined className={styles.settingsIcon} />{' '}
                        Case insensitive setting is active
                    </p>
                }
            />

            <ConditionallyRender
                condition={Boolean(constraint.inverted)}
                show={
                    <p className={classes.settingsParagraph}>
                        <ImportExportOutlined className={styles.settingsIcon} />{' '}
                        Operator is negated
                    </p>
                }
            />

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
