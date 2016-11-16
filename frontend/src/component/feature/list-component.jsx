import React, { PropTypes } from 'react';
import Feature from './feature-component';
import { Link } from 'react-router';
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list';

export default class FeatureListComponent extends React.Component {

    static propTypes () {
        return {
            onFeatureClick: PropTypes.func.isRequired,
            onFeatureRemove: PropTypes.func.isRequired,
            features: PropTypes.array.isRequired,
            featureMetrics: PropTypes.object.isRequired,
            fetchFeatureToggles: PropTypes.func.isRequired,
            fetchFeatureMetrics: PropTypes.func.isRequired,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentDidMount () {
        this.props.fetchFeatureToggles();
        this.props.fetchFeatureMetrics();
        this.timer = setInterval(() => {
            this.props.fetchFeatureMetrics();
        }, 5000);
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    render () {
        const { features, onFeatureClick, onFeatureRemove, featureMetrics } = this.props;

        return (
           <List>
                <ListSubHeader caption="Feature toggles" />
                {features.map((feature, i) =>
                    <Feature key={i}
                        metricsLastHour={featureMetrics.lastHour[feature.name]}
                        metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                        feature={feature}
                        onFeatureClick={onFeatureClick}
                        onFeatureRemove={onFeatureRemove}/>
                )}
                <ListDivider />
                <Link to="/features/create">
                    <ListItem caption="Create" legend="new feature toggle" leftIcon="add" />
                </Link>
           </List>
        );
    }
}
