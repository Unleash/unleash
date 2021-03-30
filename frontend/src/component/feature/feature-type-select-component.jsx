import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MySelect from '../common/select';

class FeatureTypeSelectComponent extends Component {
    componentDidMount() {
        const { fetchFeatureTypes, types } = this.props;
        if (types[0].initial && fetchFeatureTypes) {
            this.props.fetchFeatureTypes();
        }
    }

    render() {
        const {
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

        return <MySelect options={options} value={value} onChange={onChange} label={label} id={id} {...rest} />;
    }
}

FeatureTypeSelectComponent.propTypes = {
    value: PropTypes.string,
    filled: PropTypes.bool,
    types: PropTypes.array.isRequired,
    fetchFeatureTypes: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    id: PropTypes.string,
};

export default FeatureTypeSelectComponent;
