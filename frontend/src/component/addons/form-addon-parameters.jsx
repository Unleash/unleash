import React from 'react';
import PropTypes from 'prop-types';
import { Textfield } from 'react-mdl';

const MASKED_VALUE = '*****';

const resolveType = ({ type = 'text', sensitive = false }, value) => {
    if (sensitive && value === MASKED_VALUE) {
        return 'text';
    }
    if (type === 'textfield') {
        return 'text';
    }
    return type;
};

const AddonParameter = ({ definition, config, errors, setParameterValue }) => {
    const value = config.parameters[definition.name] || '';
    const type = resolveType(definition, value);
    const error = errors.parameters[definition.name];
    const descStyle = { fontSize: '0.8em', color: 'gray', marginTop: error ? '2px' : '-15px' };

    return (
        <div style={{ width: '80%', marginTop: '25px' }}>
            <Textfield
                floatingLabel
                style={{ width: '100%' }}
                rows={definition.type === 'textfield' ? 9 : 0}
                type={type}
                label={definition.displayName}
                name={definition.name}
                placeholder={definition.placeholder || ''}
                value={value}
                error={error}
                onChange={setParameterValue(definition.name)}
            />
            <div style={descStyle}>{definition.description}</div>
        </div>
    );
};

AddonParameter.propTypes = {
    definition: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    setParameterValue: PropTypes.func.isRequired,
};

const AddonParameters = ({ provider, config, errors, setParameterValue, editMode }) => {
    if (!provider) return null;

    return (
        <React.Fragment>
            <h4>Parameters</h4>
            {editMode ? (
                <p>
                    Sensitive parameters will be masked with value "<i>*****</i>". If you don't change the value they
                    will not be updated when saving.
                </p>
            ) : null}
            {provider.parameters.map(p => (
                <AddonParameter
                    key={p.name}
                    definition={p}
                    errors={errors}
                    config={config}
                    setParameterValue={setParameterValue}
                />
            ))}
        </React.Fragment>
    );
};

AddonParameters.propTypes = {
    provider: PropTypes.object,
    config: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    setParameterValue: PropTypes.func.isRequired,
    editMode: PropTypes.bool.optional,
};

export default AddonParameters;
