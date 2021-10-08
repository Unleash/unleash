import { TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import PropTypes from 'prop-types';

import { styles as commonStyles } from '../../../../common';
import GeneralSelect from '../../../../common/GeneralSelect/GeneralSelect';

const paramTypesOptions = [
    { key: 'string', label: 'string' },
    { key: 'percentage', label: 'percentage' },
    { key: 'list', label: 'list' },
    { key: 'number', label: 'number' },
    { key: 'boolean', label: 'boolean' },
];

const StrategyParameter = ({ set, input = {}, index }) => {
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
            <GeneralSelect
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
                control={
                    <Checkbox
                        checked={!!input.required}
                        onChange={() => set({ required: !input.required })}
                    />
                }
                label="Required"
            />
        </div>
    );
};

StrategyParameter.propTypes = {
    input: PropTypes.object,
    set: PropTypes.func,
    index: PropTypes.number,
};

export default StrategyParameter;
