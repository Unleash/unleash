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
        const muteError = () => this.props.muteError(error);
        return (
            <Snackbar
                action="Dismiss"
                active={showError}
                icon="question_answer"
                timeout={10000}
                label={error}
                onClick={muteError}
                onTimeout={muteError}
                type="warning"
            />
        );
    }
}

export default ErrorComponent;
