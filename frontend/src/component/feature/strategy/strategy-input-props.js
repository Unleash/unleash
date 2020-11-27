import PropTypes from 'prop-types';

export default {
    strategyDefinition: PropTypes.shape({
        parameters: PropTypes.array,
    }).isRequired,
    parameters: PropTypes.object.isRequired,
    updateParameter: PropTypes.func.isRequired,
    editable: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
};
