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

    onBlur(e) {
        this.setValue(e);
        window.removeEventListener('keydown', this.onKeyHandler, false);
    }

    onFocus(e) {
        e.preventDefault();
        e.stopPropagation();
        window.addEventListener('keydown', this.onKeyHandler, false);
    }

    onKeyHandler = e => {
        if (e.key === 'Enter') {
            this.setValue();
            e.preventDefault();
            e.stopPropagation();
        }
    };

    setValue = e => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const { name, list, setConfig } = this.props;
        if (this.textInput && this.textInput.inputRef && this.textInput.inputRef.value) {
            const newValues = this.textInput.inputRef.value.split(/,\s*/);
            const newList = list.concat(newValues).filter(a => a);
            this.textInput.inputRef.value = '';
            setConfig(name, newList.join(','));
        }
    };

    onClose(index) {
        const { name, list, setConfig } = this.props;
        list[index] = null;
        setConfig(name, list.length === 1 ? '' : list.filter(Boolean).join(','));
    }

    render() {
        const { name, list, disabled } = this.props;
        return (
            <div>
                <p>
                    <i>
                        Please specify the list of <code>{name}</code>:
                    </i>
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {list.map((entryValue, index) => (
                        <Chip
                            key={index + entryValue}
                            style={{ marginRight: '3px' }}
                            onClose={disabled ? undefined : () => this.onClose(index)}
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
                            name={`${name}_input`}
                            style={{ width: '100%', flex: 1 }}
                            floatingLabel
                            label="Enter value (val1, val2)"
                            onFocus={this.onFocus.bind(this)}
                            onBlur={this.onBlur.bind(this)}
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
