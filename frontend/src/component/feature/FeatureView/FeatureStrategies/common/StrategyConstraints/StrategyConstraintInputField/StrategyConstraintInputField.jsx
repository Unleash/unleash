import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconButton, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Delete } from '@material-ui/icons';

import InputListField from '../../../../../../common/input-list-field';
import ConditionallyRender from '../../../../../../common/ConditionallyRender/ConditionallyRender';
import { useCommonStyles } from '../../../../../../../common.styles';
import { useStyles } from './StrategyConstraintInputField.styles';
import { CONSTRAINT_AUTOCOMPLETE_ID } from '../../../../../../../testIds';
import GeneralSelect from '../../../../../../common/GeneralSelect/GeneralSelect';

const constraintOperators = [
    { key: 'IN', label: 'IN' },
    { key: 'NOT_IN', label: 'NOT_IN' },
];

const StrategyConstraintInputField = ({
    constraint,
    updateConstraint,
    removeConstraint,
    contextFields,
    id,
    constraintError,
    setConstraintError,
}) => {
    useEffect(() => {
        return () => {
            resetError();
        };
        /*eslint-disable-next-line */
    }, []);

    const checkError = () => {
        const values = constraint.values;
        const filtered = values.filter(v => v).map(v => v.trim());
        if (filtered.length !== values.length) {
            updateConstraint(filtered, 'values');
        }
        if (filtered.length === 0) {
            setConstraintError(prev => ({
                ...prev,
                [id]: 'You need to specify at least one value',
            }));
        } else {
            resetError();
        }
    };

    const resetError = () =>
        setConstraintError(prev => ({ ...prev, [id]: undefined }));

    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const onBlur = evt => {
        evt.preventDefault();
        checkError();
    };

    const handleChangeValue = selectedOptions => {
        const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
        updateConstraint(values, 'values');
        checkError();
    };

    const constraintContextNames = contextFields.map(f => ({
        key: f.name,
        label: f.name,
    }));
    const constraintDef = contextFields.find(
        c => c.name === constraint.contextName
    );

    const options =
        constraintDef &&
        constraintDef.legalValues &&
        constraintDef.legalValues.length > 0
            ? constraintDef.legalValues.map(l => ({ value: l, label: l }))
            : undefined;
    const values = constraint.values.map(v => ({ value: v, label: v }));

    const error = constraintError[id];

    return (
        <tr className={commonStyles.contentSpacingY}>
            <td className={styles.tableCell}>
                <GeneralSelect
                    name="contextName"
                    label="Context Field"
                    options={constraintContextNames}
                    value={constraint.contextName || ''}
                    onChange={evt =>
                        updateConstraint(evt.target.value, 'contextName')
                    }
                    className={styles.contextField}
                />
            </td>
            <td className={styles.tableCell}>
                <GeneralSelect
                    name="operator"
                    label="Operator"
                    options={constraintOperators}
                    value={constraint.operator}
                    onChange={evt =>
                        updateConstraint(evt.target.value, 'operator')
                    }
                    className={styles.operator}
                />
            </td>
            <td className={styles.tableCell} style={{ width: '100%' }}>
                <ConditionallyRender
                    condition={options}
                    show={
                        <div className={styles.inputContainer}>
                            <Autocomplete
                                multiple
                                size="small"
                                options={options}
                                data-test={CONSTRAINT_AUTOCOMPLETE_ID}
                                value={values || []}
                                getOptionLabel={option => option.label}
                                onBlur={onBlur}
                                onFocus={() => resetError()}
                                getOptionSelected={(option, value) =>
                                    option.value === value.value
                                }
                                filterSelectedOptions
                                filterOptions={options =>
                                    options.filter(
                                        o =>
                                            !values.some(
                                                v => v.value === o.value
                                            )
                                    )
                                }
                                onChange={(evt, values) =>
                                    handleChangeValue(values)
                                }
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label={'Values'}
                                        error={Boolean(error)}
                                        helperText={error}
                                        FormHelperTextProps={{
                                            classes: {
                                                root: styles.helperText,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </div>
                    }
                    elseShow={
                        <div className={styles.inputContainer}>
                            <InputListField
                                name="values"
                                error={Boolean(error)}
                                errorText={error}
                                onBlur={onBlur}
                                values={constraint.values}
                                label="Values (v1, v2, v3)"
                                updateValues={values =>
                                    updateConstraint(values, 'values')
                                }
                                helperText={error}
                                FormHelperTextProps={{
                                    classes: {
                                        root: styles.helperText,
                                    },
                                }}
                            />
                        </div>
                    }
                />
            </td>
            <td className={styles.tableCell}>
                <IconButton onClick={removeConstraint}>
                    <Delete />
                </IconButton>
            </td>
        </tr>
    );
};
StrategyConstraintInputField.propTypes = {
    id: PropTypes.string.isRequired,
    constraint: PropTypes.object.isRequired,
    updateConstraint: PropTypes.func.isRequired,
    removeConstraint: PropTypes.func.isRequired,
    contextFields: PropTypes.array.isRequired,
};

export default StrategyConstraintInputField;
