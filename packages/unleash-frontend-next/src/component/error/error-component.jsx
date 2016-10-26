import Snackbar from 'react-toolbox/lib/snackbar';
import React, { PropTypes } from 'react';

class ErrorComponent extends React.Component {
    static propTypes () {
        return {
            errors: PropTypes.array.isRequired,
            muteError: PropTypes.func.isRequired,
        };
    }

    render () {
        const showError = this.props.errors.length > 0;
        const error = showError ? this.props.errors[0] : undefined;
        return (
            <Snackbar
                action="Dismiss"
                active={showError}
                icon="question_answer"
                label={error}
                onClick={() => this.props.muteError(error)}
                type="warning"
            />
        );
    }
}

export default ErrorComponent;
