import React, { PropTypes } from 'react';
import Feature from './Feature';

export default class FeatureList extends React.Component {
    constructor () {
        super();
    }

    static propTypes () {
        return {
            onFeatureClick: PropTypes.func.isRequired,
            features: PropTypes.array.isRequired,
            fetchFeatureToggles: PropTypes.array.isRequired,
        };
    }

    componentDidMount () {
        // TODO: only fetch from server if we don't know about any toggles.
        if (this.props.features.length === 0) {
            this.props.fetchFeatureToggles();
        }
    }

    render () {
        const onFeatureClick = this.props.onFeatureClick;
        const features = this.props.features.map(featureToggle =>
                <Feature key={featureToggle.name}
                    {...featureToggle}
                    onClick={() => onFeatureClick(featureToggle.name)}
                />);

        return (
            <ul>{features}</ul>
        );
    }
}
