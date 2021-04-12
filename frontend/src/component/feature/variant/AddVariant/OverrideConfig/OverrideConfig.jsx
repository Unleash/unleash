import { connect } from 'react-redux';
import classnames from 'classnames';

import PropTypes from 'prop-types';
import { Grid, IconButton, Icon } from '@material-ui/core';
import MySelect from '../../../../common/select';
import InputListField from '../../../../common/input-list-field';
import { selectStyles } from '../../../../common';
import ConditionallyRender from '../../../../common/ConditionallyRender/ConditionallyRender';
import { useCommonStyles } from '../../../../../common.styles';
import { useStyles } from './OverrideConfig.styles.js';

const OverrideConfig = ({
    overrides,
    updateOverrideType,
    updateOverrideValues,
    removeOverride,
    contextDefinitions,
}) => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();
    const contextNames = contextDefinitions.map(c => ({
        key: c.name,
        label: c.name,
    }));

    const updateValues = i => values => {
        updateOverrideValues(i, values);
    };

    const updateSelectValues = i => values => {
        updateOverrideValues(i, values ? values.map(v => v.value) : undefined);
    };

    const mapSelectValues = (values = []) =>
        values.map(v => ({ label: v, value: v }));

    return overrides.map((o, i) => {
        const legalValues =
            contextDefinitions.find(c => c.name === o.contextName)
                .legalValues || [];
        const options = legalValues.map(v => ({ value: v, label: v, key: v }));

        return (
            <Grid container key={`override=${i}`} alignItems="center">
                <Grid item md={3} className={styles.contextFieldSelect}>
                    <MySelect
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
                <Grid md={7} item>
                    <ConditionallyRender
                        condition={legalValues && legalValues.length > 0}
                        show={
                            <div style={{ paddingTop: '12px' }}>
                                <MySelect
                                    key={`override-select=${i}`}
                                    className={selectStyles}
                                    classes={{ root: commonStyles.fullWidth }}
                                    value={mapSelectValues(o.values)}
                                    options={options}
                                    onChange={updateSelectValues(i)}
                                />
                            </div>
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
                        <Icon>delete</Icon>
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

const mapStateToProps = state => ({
    contextDefinitions: state.context.toJS(),
});

export default connect(mapStateToProps, {})(OverrideConfig);
