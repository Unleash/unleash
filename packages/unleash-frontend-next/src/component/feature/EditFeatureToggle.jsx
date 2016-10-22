import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

const mapStateToProps = (state) => ({
    strategies: state.strategies.toJS(),
});

class EditFeatureToggle extends React.Component {
    constructor () {
        super();
        this.state = {
            featureToggle: {
                name: '',
                description: '',
                enabled: false,
                strategies: [],
            },
        };
    }

    static propTypes () {
        return {
            dispatch: PropTypes.func.isRequired,
            strategies: PropTypes.array,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    render () {
        return (
            <div>
                <p>edit input</p>
            </div>
        );
    }
}

export default connect(mapStateToProps)(EditFeatureToggle);
