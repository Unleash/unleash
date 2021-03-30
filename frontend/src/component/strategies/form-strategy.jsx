import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Typography, TextField, FormControlLabel, Checkbox, Button, Icon } from '@material-ui/core';

import MySelect from '../common/select';
import PageContent from '../common/PageContent/PageContent';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';

import { styles as commonStyles, FormButtons } from '../common';
import { trim } from '../common/util';

function gerArrayWithEntries(num) {
    return Array.from(Array(num));
}

const paramTypesOptions = [
    { key: 'string', label: 'string' },
    { key: 'percentage', label: 'percentage' },
    { key: 'list', label: 'list' },
    { key: 'number', label: 'number' },
    { key: 'boolean', label: 'boolean' },
];

const Parameter = ({ set, input = {}, index }) => {
    const handleTypeChange = event => {
        set({ type: event.target.value });
    };

    return (
        <div className={commonStyles.contentSpacing}>
            <TextField
                style={{ width: '50%', marginRight: '5px' }}
                label={`Parameter name ${index + 1}`}
                onChange={({ target }) => set({ name: target.value }, true)}
                value={input.name || ''}
                variant="outlined"
                size="small"
            />
            <MySelect
                label="Type"
                options={paramTypesOptions}
                value={input.type || 'string'}
                onChange={handleTypeChange}
                id={`prop-type-${index}-select`}
            />

            <TextField
                style={{ width: '100%' }}
                rows={2}
                multiline
                label={`Parameter name ${index + 1} description`}
                onChange={({ target }) => set({ description: target.value })}
                value={input.description || ''}
                variant="outlined"
                size="small"
            />
            <FormControlLabel
                control={<Checkbox checked={!!input.required} onChange={() => set({ required: !input.required })} />}
                label="Required"
            />
        </div>
    );
};
Parameter.propTypes = {
    input: PropTypes.object,
    set: PropTypes.func,
    index: PropTypes.number,
};

const Parameters = ({ input = [], count = 0, updateParameter }) => (
    <div>
        {gerArrayWithEntries(count).map((v, i) => (
            <Parameter key={i} set={v => updateParameter(i, v, true)} index={i} input={input[i]} />
        ))}
    </div>
);

Parameters.propTypes = {
    input: PropTypes.array,
    updateParameter: PropTypes.func.isRequired,
    count: PropTypes.number,
};

class AddStrategy extends Component {
    static propTypes = {
        input: PropTypes.object,
        setValue: PropTypes.func,
        appParameter: PropTypes.func,
        updateParameter: PropTypes.func,
        clear: PropTypes.func,
        onCancel: PropTypes.func,
        onSubmit: PropTypes.func,
        editMode: PropTypes.bool,
    };

    getHeaderTitle = () => {
        const { editMode } = this.props;
        if (editMode) return 'Edit strategy';
        return 'Create a new strategy';
    };

    render() {
        const { input, setValue, appParameter, onCancel, editMode = false, onSubmit, updateParameter } = this.props;

        return (
            <PageContent headerContent={this.getHeaderTitle()}>
                <ConditionallyRender
                    condition={editMode}
                    show={
                        <Typography variant="p">
                            Be careful! Changing a strategy definition might also require changes to the implementation
                            in the clients.
                        </Typography>
                    }
                />

                <form onSubmit={onSubmit} className={commonStyles.contentSpacing} style={{ maxWidth: '400px' }}>
                    <TextField
                        label="Strategy name"
                        name="name"
                        placeholder=""
                        disabled={editMode}
                        onChange={({ target }) => setValue('name', trim(target.value))}
                        value={input.name}
                        variant="outlined"
                        size="small"
                    />

                    <TextField
                        className={commonStyles.fullwidth}
                        multiline
                        rows={2}
                        label="Description"
                        name="description"
                        placeholder=""
                        onChange={({ target }) => setValue('description', target.value)}
                        value={input.description}
                        variant="outlined"
                        size="small"
                    />

                    <Parameters
                        input={input.parameters}
                        count={input.parameters.length}
                        updateParameter={updateParameter}
                    />
                    <Button
                        onClick={e => {
                            e.preventDefault();
                            appParameter();
                        }}
                        startIcon={<Icon>add</Icon>}
                    >
                        Add parameter
                    </Button>

                    <FormButtons submitText={editMode ? 'Update' : 'Create'} onCancel={onCancel} />
                </form>
            </PageContent>
        );
    }
}

export default AddStrategy;
