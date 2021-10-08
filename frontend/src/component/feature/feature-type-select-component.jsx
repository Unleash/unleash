import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GeneralSelect from '../common/GeneralSelect/GeneralSelect';

class FeatureTypeSelectComponent extends Component {
    componentDidMount() {
        const { fetchFeatureTypes, types } = this.props;
        if (types && types[0].initial && fetchFeatureTypes) {
            this.props.fetchFeatureTypes();
        }
    }

    render() {
        const {
            editable,
            value,
            types,
            onChange,
            label,
            id,
            // eslint-disable-next-line no-unused-vars
            fetchFeatureTypes,
            ...rest
        } = this.props;

        const options = types.map(t => ({
            key: t.id,
            label: t.name,
            title: t.description,
        }));

        if (!options.find(o => o.key === value)) {
            options.push({ key: value, label: value });
        }

        return (
            <GeneralSelect
                disabled={!editable}
                options={options}
                value={value}
                onChange={onChange}
                label={label}
                id={id}
                {...rest}
            />
        );
    }
}

FeatureTypeSelectComponent.propTypes = {
    editable: PropTypes.bool.isRequired,
    value: PropTypes.string,
    filled: PropTypes.bool,
    types: PropTypes.array.isRequired,
    fetchFeatureTypes: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    id: PropTypes.string,
};

export default FeatureTypeSelectComponent;
