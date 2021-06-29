import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TextField, Button, Chip, Typography } from '@material-ui/core';
import { Add } from '@material-ui/icons';

import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';

export default class InputList extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        list: PropTypes.array.isRequired,
        setConfig: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
    };

    constructor() {
        super();
        this.state = {
            input: '',
        };
    }

    onBlur = e => {
        this.setValue(e);
    };

    onKeyDown = e => {
        if (e.key === 'Enter') {
            this.setValue(e);
            e.preventDefault();
            e.stopPropagation();
        }
    };

    setValue = evt => {
        evt.preventDefault();
        const value = evt.target.value;

        const { name, list, setConfig } = this.props;
        if (value) {
            const newValues = value
                .split(/,\s*/)
                .filter(a => !list.includes(a));
            if (newValues.length > 0) {
                const newList = list.concat(newValues).filter(a => a);
                setConfig(name, newList.join(','));
            }
            this.setState({ input: '' });
        }
    };

    onClose(index) {
        const { name, list, setConfig } = this.props;
        list[index] = null;
        setConfig(
            name,
            list.length === 1 ? '' : list.filter(Boolean).join(',')
        );
    }

    onChange = e => {
        this.setState({ input: e.currentTarget.value });
    };

    render() {
        const { name, list, disabled } = this.props;
        return (
            <div>
                <Typography variant="subtitle2">List of {name}</Typography>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        margin: '10px 0',
                    }}
                >
                    {list.map((entryValue, index) => (
                        <Chip
                            key={index + entryValue}
                            label={entryValue}
                            style={{ marginRight: '3px', border: '1px solid' }}
                            onDelete={
                                disabled ? undefined : () => this.onClose(index)
                            }
                            title="Remove value"
                        />
                    ))}
                </div>
                <ConditionallyRender
                    condition={!disabled}
                    show={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                name={`input_field`}
                                variant="outlined"
                                label="Add items"
                                value={this.state.input}
                                size="small"
                                placeholder=""
                                onBlur={this.onBlur}
                                onChange={this.onChange}
                                onKeyDown={this.onKeyDown}
                            />
                            <Button
                                onClick={this.setValue}
                                color="secondary"
                                startIcon={<Add />}
                            >
                                Add
                            </Button>
                        </div>
                    }
                />
            </div>
        );
    }
}
