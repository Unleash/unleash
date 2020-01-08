import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { IconButton, Cell, Grid, Textfield, Tooltip, Icon } from 'react-mdl';
import styles from './variant.scss';

class VariantEditComponent extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.refs.name.inputRef.focus();
    }

    getUserIdOverrides(variant) {
        const overrides = variant.overrides || [];
        const userIdOverrides = overrides.find(o => o.contextName === 'userId') || { values: [] };
        return userIdOverrides.values.join(', ');
    }

    toggleEditMode = e => {
        e.preventDefault();
        this.setState({
            editmode: !this.state.editmode,
        });
    };

    updateToggleName = e => {
        e.preventDefault();
        const variant = this.props.variant;
        variant.name = e.target.value;
        this.props.updateVariant(variant);
    };

    updatePayload = e => {
        e.preventDefault();
        const variant = this.props.variant;
        variant.payload = {
            type: 'string',
            value: e.target.value,
        };
        this.props.updateVariant(variant);
    };

    updateOverrides = (contextName, e) => {
        e.preventDefault();
        const values = e.target.value.split(',').map(v => v.trim());
        const variant = this.props.variant;

        // Clean empty string. (should be moved to action)
        if (values.length === 1 && !values[0]) {
            variant.overrides = undefined;
        } else {
            variant.overrides = [{ contextName, values }];
        }
        this.props.updateVariant(variant);
    };

    render() {
        const { variant, closeVariant, removeVariant } = this.props;
        const payload = variant.payload ? variant.payload.value : '';
        const userIdOverrides = this.getUserIdOverrides(variant);

        return (
            <tr>
                <td>
                    <Grid noSpacing>
                        <Cell col={6}>
                            <Textfield
                                floatingLabel
                                ref="name"
                                label="Name"
                                name="name"
                                required
                                value={variant.name}
                                onChange={this.updateToggleName}
                            />
                        </Cell>
                        <Cell col={6} />
                    </Grid>
                    <Grid noSpacing>
                        <Cell col={11}>
                            <Textfield
                                floatingLabel
                                rows={1}
                                label="Payload"
                                name="payload"
                                style={{ width: '100%' }}
                                value={payload}
                                onChange={this.updatePayload}
                            />
                        </Cell>
                        <Cell col={1} style={{ margin: 'auto', padding: '0 5px' }}>
                            <Tooltip
                                label={
                                    <span>
                                        Passed to the variant object. <br />
                                        Can be anything (json, value, csv)
                                    </span>
                                }
                            >
                                <Icon name="info" />
                            </Tooltip>
                        </Cell>
                    </Grid>
                    <Grid noSpacing>
                        <Cell col={11}>
                            <Textfield
                                floatingLabel
                                label="overrides.userId"
                                name="overrides.userId"
                                style={{ width: '100%' }}
                                value={userIdOverrides}
                                onChange={this.updateOverrides.bind(this, 'userId')}
                            />
                        </Cell>
                        <Cell col={1} style={{ margin: 'auto', padding: '0 5px' }}>
                            <Tooltip
                                label={
                                    <div>
                                        Here you can specify which users that <br />
                                        should get this variant.
                                    </div>
                                }
                            >
                                <Icon name="info" />
                            </Tooltip>
                        </Cell>
                    </Grid>
                    <a href="#close" onClick={closeVariant}>
                        Close
                    </a>
                </td>
                <td className={styles.actions}>
                    <Textfield
                        floatingLabel
                        label="Weight"
                        name="weight"
                        value={variant.weight}
                        style={{ width: '40px' }}
                        disabled
                        onChange={() => {}}
                    />
                </td>
                <td className={styles.actions}>
                    <IconButton name="expand_less" onClick={closeVariant} />
                    <IconButton name="delete" onClick={removeVariant} />
                </td>
            </tr>
        );
    }
}

VariantEditComponent.propTypes = {
    variant: PropTypes.object,
    removeVariant: PropTypes.func,
    updateVariant: PropTypes.func,
    closeVariant: PropTypes.func,
};

export default VariantEditComponent;
