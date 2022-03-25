import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Grid, IconButton, TextField } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { useStyles } from './OverrideConfig.styles.js';
import { Autocomplete } from '@material-ui/lab';
import GeneralSelect from '../../../../../../common/GeneralSelect/GeneralSelect';
import { useCommonStyles } from '../../../../../../../common.styles';
import ConditionallyRender from '../../../../../../common/ConditionallyRender';
import InputListField from '../../../../../../common/InputListField.jsx';
import useUnleashContext from '../../../../../../../hooks/api/getters/useUnleashContext/useUnleashContext';

export const OverrideConfig = ({
    overrides,
    updateOverrideType,
    updateOverrideValues,
    removeOverride,
}) => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();

    const { context } = useUnleashContext();
    const contextNames = context.map(c => ({
        key: c.name,
        label: c.name,
    }));

    const updateValues = i => values => {
        updateOverrideValues(i, values);
    };

    const updateSelectValues = i => (e, options) => {
        updateOverrideValues(i, options ? options : []);
    };

    return overrides.map((o, i) => {
        const definition = context.find(c => c.name === o.contextName);
        const legalValues = definition ? definition.legalValues : [];

        return (
            <Grid container key={`override=${i}`} alignItems="center">
                <Grid
                    item
                    md={3}
                    sm={3}
                    xs={3}
                    className={styles.contextFieldSelect}
                >
                    <GeneralSelect
                        name="contextName"
                        label="Context Field"
                        value={o.contextName}
                        options={contextNames}
                        classes={{
                            root: classnames(commonStyles.fullWidth),
                        }}
                        onChange={updateOverrideType(i)}
                    />
                </Grid>
                <Grid md={7} sm={7} xs={6} item>
                    <ConditionallyRender
                        condition={legalValues && legalValues.length > 0}
                        show={
                            <Autocomplete
                                multiple
                                id={`override-select-${i}`}
                                getOptionSelected={(option, value) => {
                                    return option === value;
                                }}
                                options={legalValues}
                                onChange={updateSelectValues(i)}
                                getOptionLabel={option => option}
                                defaultValue={o.values}
                                value={o.values}
                                style={{ width: '100%' }}
                                filterSelectedOptions
                                size="small"
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Legal values"
                                        style={{ width: '100%' }}
                                    />
                                )}
                            />
                        }
                        elseShow={
                            <InputListField
                                label="Values (v1, v2, ...)"
                                name="values"
                                placeholder=""
                                classes={{ root: commonStyles.fullWidth }}
                                values={o.values}
                                updateValues={updateValues(i)}
                            />
                        }
                    />
                </Grid>
                <Grid item md={1}>
                    <IconButton onClick={removeOverride(i)}>
                        <Delete />
                    </IconButton>
                </Grid>
            </Grid>
        );
    });
};

OverrideConfig.propTypes = {
    overrides: PropTypes.array.isRequired,
    updateOverrideType: PropTypes.func.isRequired,
    updateOverrideValues: PropTypes.func.isRequired,
    removeOverride: PropTypes.func.isRequired,
};
