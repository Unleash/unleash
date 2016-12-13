import React, { Component, PropTypes } from 'react';
import {
    Textfield,
    IconButton,
    Chip,
}  from 'react-mdl';

export default class InputList extends Component {

    static propTypes = {
        field: PropTypes.string.isRequired,
        list: PropTypes.array.isRequired,
        setConfig: PropTypes.func.isRequired,
    }

    onBlur = (e) => {
        this.setValue(e);
        window.removeEventListener('keydown', this.onKeyHandler, false);
    }

    onFocus  = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.addEventListener('keydown', this.onKeyHandler, false);
    }

    onKeyHandler = (e) => {
        if (e.key === 'Enter') {
            this.setValue();
            e.preventDefault();
            e.stopPropagation();
        }
    }

    setValue = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const { field, list, setConfig } = this.props;
        const inputValue = document.querySelector(`[name="${field}_input"]`);
        if (inputValue && inputValue.value) {
            list.push(inputValue.value);
            inputValue.value = '';
            setConfig(field, list.join(','));
        }
    }

    onClose (index) {
        const { field, list, setConfig } = this.props;
        list[index] = null;
        setConfig(field, list.length === 1 ? '' : list.filter(Boolean).join(','));
    }

    render () {
        const { name, list } = this.props;
        return (<div>
            <p>{name}</p>
            {list.map((entryValue, index) => (
                <Chip
                    key={index + entryValue}
                    style={{ marginRight: '3px' }}
                    onClose={() => this.onClose(index)}>{entryValue}</Chip>
            ))}

            <div style={{ display: 'flex' }}>
                <Textfield
                    name={`${name}_input`}
                    style={{ width: '100%', flex: 1 }}
                    floatingLabel
                    label="Add list entry"
                    onFocus={this.onFocus}
                    onBlur={this.onBlur} />
                <IconButton name="add" raised style={{ flex: 1, flexGrow: 0, margin: '20px 0 0 10px' }} onClick={this.setValue} />
            </div>

        </div>);
    }
}
