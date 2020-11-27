import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfield, IconButton, Chip } from 'react-mdl';

export default class InputList extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        list: PropTypes.array.isRequired,
        setConfig: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
    };

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
            const newValues = value.split(/,\s*/).filter(a => !list.includes(a));
            if (newValues.length > 0) {
                const newList = list.concat(newValues).filter(a => a);
                setConfig(name, newList.join(','), true);
            }
            this.textInput.inputRef.value = '';
        }
    };

    onClose(index) {
        const { name, list, setConfig } = this.props;
        list[index] = null;
        setConfig(name, list.length === 1 ? '' : list.filter(Boolean).join(','), true);
    }

    render() {
        const { name, list, disabled } = this.props;
        return (
            <div>
                <strong>List of {name}</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', margin: '10px 0' }}>
                    {list.map((entryValue, index) => (
                        <Chip
                            key={index + entryValue}
                            className="mdl-color--blue-grey-100"
                            style={{ marginRight: '3px', border: '1px solid' }}
                            onClose={disabled ? undefined : () => this.onClose(index)}
                            title="Remove value"
                        >
                            {entryValue}
                        </Chip>
                    ))}
                </div>
                {disabled ? (
                    ''
                ) : (
                    <div style={{ display: 'flex' }}>
                        <Textfield
                            name={`input_field`}
                            style={{ width: '100%', maxWidth: '200px', flex: 1 }}
                            floatingLabel
                            label="Add items:"
                            placeholder=""
                            onBlur={this.onBlur}
                            onKeyDown={this.onKeyDown}
                            ref={input => {
                                this.textInput = input;
                            }}
                        />
                        <IconButton
                            name="add"
                            raised
                            style={{ flex: 1, flexGrow: 0, margin: '20px 0 0 10px' }}
                            onClick={this.setValue}
                        />
                    </div>
                )}
            </div>
        );
    }
}
