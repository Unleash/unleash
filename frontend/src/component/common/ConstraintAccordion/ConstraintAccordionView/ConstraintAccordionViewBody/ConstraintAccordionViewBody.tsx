import { Chip } from '@material-ui/core';
import { ImportExportOutlined, TextFormatOutlined } from '@material-ui/icons';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { useState } from 'react';
import { stringOperators } from '../../../../../constants/operators';
import { IConstraint } from '../../../../../interfaces/strategy';
import { oneOf } from '../../../../../utils/one-of';
import ConditionallyRender from '../../../ConditionallyRender';
import { useStyles } from '../../ConstraintAccordion.styles';
import { ConstraintValueSearch } from '../../ConstraintValueSearch/ConstraintValueSearch';
import { formatConstraintValue } from 'component/common/Constraint/formatConstraintValue';
import { useLocationSettings } from 'hooks/useLocationSettings';

interface IConstraintAccordionViewBodyProps {
    constraint: IConstraint;
}

export const ConstraintAccordionViewBody = ({
    constraint,
}: IConstraintAccordionViewBodyProps) => {
    const styles = useStyles();
    const { locationSettings } = useLocationSettings();

    return (
        <div>
            <ConditionallyRender
                condition={
                    oneOf(stringOperators, constraint.operator) &&
                    Boolean(constraint.caseInsensitive)
                }
                show={
                    <p className={styles.settingsParagraph}>
                        <TextFormatOutlined className={styles.settingsIcon} />{' '}
                        Case insensitive setting is active
                    </p>
                }
            />

            <ConditionallyRender
                condition={Boolean(constraint.inverted)}
                show={
                    <p className={styles.settingsParagraph}>
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

interface ISingleValueProps {
    value: string | undefined;
    operator: string;
}

const SingleValue = ({ value, operator }: ISingleValueProps) => {
    const styles = useStyles();
    if (!value) return null;

    return (
        <div className={styles.singleValueView}>
            <p className={styles.singleValueText}>Value must be {operator}</p>{' '}
            <Chip
                label={
                    <StringTruncator
                        maxWidth="200"
                        text={value}
                        maxLength={25}
                    />
                }
                className={styles.chip}
            />
        </div>
    );
};

interface IMultipleValuesProps {
    values: string[] | undefined;
}

const MultipleValues = ({ values }: IMultipleValuesProps) => {
    const [filter, setFilter] = useState('');
    const styles = useStyles();

    if (!values || values.length === 0) return null;

    return (
        <>
            <ConstraintValueSearch filter={filter} setFilter={setFilter} />
            {values
                .filter(value => value.includes(filter))
                .map((value, index) => (
                    <Chip
                        key={`${value}-${index}`}
                        label={
                            <StringTruncator
                                maxWidth="200"
                                text={value}
                                maxLength={25}
                                className={styles.chipValue}
                            />
                        }
                        className={styles.chip}
                    />
                ))}
        </>
    );
};
