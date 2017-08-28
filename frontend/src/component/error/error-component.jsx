import React from 'react';
import PropTypes from 'prop-types';

import { Snackbar, Icon } from 'react-mdl';

const ErrorComponent = ({ errors, ...props }) => {
    const showError = errors.length > 0;
    const error = showError ? errors[0] : undefined;
    const muteError = () => props.muteError(error);
    return (
        <Snackbar action="Dismiss" active={showError} onActionClick={muteError} onTimeout={muteError} timeout={10000}>
            <Icon name="question_answer" /> {error}
        </Snackbar>
    );
};

ErrorComponent.propTypes = {
    errors: PropTypes.array.isRequired,
    muteError: PropTypes.func.isRequired,
};

export default ErrorComponent;
