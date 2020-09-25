import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'debounce';
import { FABButton, Icon, Textfield } from 'react-mdl';

function SearchField({ value, updateValue }) {
    const [localValue, setLocalValue] = useState(value);
    const debounceUpdateValue = debounce(updateValue, 500);

    const handleCange = e => {
        e.preventDefault();
        const v = e.target.value || '';
        setLocalValue(v);
        debounceUpdateValue(v);
    };

    const handleKeyPress = e => {
        if (e.key === 'Enter') {
            updateValue(localValue);
        }
    };

    const updateNow = () => {
        updateValue(localValue);
    };

    return (
        <div>
            <Textfield
                floatingLabel
                value={localValue}
                onChange={handleCange}
                onBlur={updateNow}
                onKeyPress={handleKeyPress}
                label="Search"
                style={{ width: '500px', maxWidth: '80%' }}
            />
            <FABButton mini className={'mdl-cell--hide-phone'}>
                <Icon name="search" />
            </FABButton>
        </div>
    );
}

SearchField.propTypes = {
    value: PropTypes.string.isRequired,
    updateValue: PropTypes.func.isRequired,
};

export default SearchField;
