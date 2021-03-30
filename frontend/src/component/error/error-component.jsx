import React from 'react';
import PropTypes from 'prop-types';

import { Snackbar, Icon, IconButton } from '@material-ui/core';

const ErrorComponent = ({ errors, ...props }) => {
    const showError = errors.length > 0;
    const error = showError ? errors[0] : undefined;
    const muteError = () => props.muteError(error);
    return (
        <Snackbar
            action={
                <React.Fragment>
                    <IconButton size="small" aria-label="close" color="inherit" onClick={muteError}>
                        <Icon>close</Icon>
                    </IconButton>
                </React.Fragment>
            }
            open={showError}
            onClose={muteError}
            autoHideDuration={10000}
            message={
                <div>
                    <Icon>question_answer</Icon>
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
