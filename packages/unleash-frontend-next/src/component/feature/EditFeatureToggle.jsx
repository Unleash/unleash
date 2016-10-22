import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateFeatureToggle } from '../../store/feature-actions';
import AddFeatureToggleUI from './AddFeatureToggleUI';

const mapStateToProps = (state, ownProps) => ({
    strategies: state.strategies.toJS(),
    featureToggle: state.features.toJS().find(toggle => toggle.name === ownProps.featureToggleName) || {},
});

class AddFeatureToggle extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            name: props.featureToggle.name || '',
            description: props.featureToggle.description || '',
            enabled: props.featureToggle.enabled || false,
            strategies: props.featureToggle.strategies || [],
        };
    }

    static propTypes () {
        return {
            dispatch: PropTypes.func.isRequired,
            strategies: PropTypes.array,
            featureToggle: PropTypes.featureToggle.isRequired,
            fetchFeatureToggles: PropTypes.func.isRequired,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    onSubmit = (evt) => {
        evt.preventDefault();
        this.props.dispatch(updateFeatureToggle(this.state));
        this.context.router.push('/features');
    };

    onCancel = (evt) => {
        evt.preventDefault();
        this.context.router.push('/features');
    };

    updateField = (key, value) => {
        const change = {};
        change[key] = value;
        this.setState(change);
    };

    addStrategy = (strategy) => {
        const strategies = this.state.strategies;
        strategies.push(strategy);
        this.setState({ strategies });
    }

    removeStrategy = (strategy) => {
        const strategies = this.state.strategies.filter(s => s !== strategy);
        this.setState({ strategies });
    }

    render () {
        return (
            <div>
                <AddFeatureToggleUI
                    editmode="true"
                    strategies={this.props.strategies}
                    featureToggle={this.state}
                    updateField={this.updateField}
                    addStrategy={this.addStrategy}
                    removeStrategy={this.removeStrategy}
                    onSubmit={this.onSubmit}
                    onCancel={this.onCancel}
                    
                />
            </div>
        );
    }
}

export default connect(mapStateToProps)(AddFeatureToggle);
