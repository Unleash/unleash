import React from 'react';
import PropTypes from 'prop-types';

import { Snackbar, IconButton } from '@material-ui/core';
import { Close, QuestionAnswer } from '@material-ui/icons';

const ErrorComponent = ({ errors, muteError }) => {
    const showError = errors.length > 0;
    const error = showError ? errors[0] : undefined;
    return (
        <Snackbar
            action={
                <React.Fragment>
                    <IconButton size="small" aria-label="close" color="inherit">
                        <Close />
                    </IconButton>
                </React.Fragment>
            }
            open={showError}
            onClose={() => muteError(error)}
            autoHideDuration={10000}
            message={
                <div key={error}>
                    <QuestionAnswer />
                    {error}
                </div>
            }
        />
    );
};

ErrorComponent.propTypes = {
    errors: PropTypes.array.isRequired,
    muteError: PropTypes.func.isRequired,
};

export default ErrorComponent;
