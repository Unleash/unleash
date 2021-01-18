import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MySelect from '../common/select';

class TagTypeSelectComponent extends Component {
    componentDidMount() {
        const { fetchTagTypes } = this.props;
        if (fetchTagTypes) {
            this.props.fetchTagTypes();
        }
    }

    render() {
        const { value, types, onChange, filled } = this.props;
        const options = types.map(t => ({ key: t.name, label: t.name, title: t.name }));

        return <MySelect label="Tag type" options={options} value={value} onChange={onChange} filled={filled} />;
    }
}

TagTypeSelectComponent.propTypes = {
    value: PropTypes.string,
    filled: PropTypes.bool,
    types: PropTypes.array.isRequired,
    fetchTagTypes: PropTypes.func,
    onChange: PropTypes.func.isRequired,
};

export default TagTypeSelectComponent;
