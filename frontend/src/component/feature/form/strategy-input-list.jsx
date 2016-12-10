import React from 'react';
import {
    Textfield,
    IconButton,
    Chip,
}  from 'react-mdl';

export default ({ field, list, setConfig }) => (
    <div style={{ margin: '16px 20px' }}>
        <h6>{field}</h6>
        {list.map((entryValue, index) => (
            <Chip style={{ marginRight: '3px' }} onClose={() => {
                list[index] = null;
                setConfig(field, list.filter(Boolean).join(','));
            }}>{entryValue}</Chip>
        ))}

        <form style={{ display: 'block', padding: 0, margin: 0 }} onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const inputValue = document.querySelector(`[name="${field}_input"]`);
            if (inputValue && inputValue.value) {
                list.push(inputValue.value);
                inputValue.value = '';
                setConfig(field, list.join(','));
            }
        }}>
            <div style={{ display: 'flex' }}>
                <Textfield name={`${field}_input`} style={{ width: '100%', flex: 1 }} floatingLabel label="Add list entry" />
                <IconButton name="add" raised style={{ flex: 1, flexGrow: 0, margin: '20px 0 0 10px' }}/>
            </div>
        </form>

    </div>
);
