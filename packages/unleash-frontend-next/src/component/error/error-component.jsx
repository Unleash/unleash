import Snackbar from 'react-toolbox/lib/snackbar';
import React, { PropTypes } from 'react';

class ErrorComponent extends React.Component {
    static propTypes () {
        return {
            errors: PropTypes.array.isRequired,
            showError: PropTypes.bool,
            muteErrors: PropTypes.func.isRequired,
        };
    }

    render () {
        const snackbarMsg = this.props.errors.join(', ');
        return (
            <Snackbar
                action="Dismiss"
                active={this.props.showError}
                icon="question_answer"
                label={snackbarMsg}
                ref="snackbar"
                onClick={this.props.muteErrors}
                onTimeout={this.props.muteErrors}
                type="warning"
            />
        );
    }
}

export default ErrorComponent;
