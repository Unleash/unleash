import React, { PropTypes } from 'react';
import Feature from './feature-component';
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list';

export default class FeatureListComponent extends React.Component {

    static propTypes () {
        return {
            onFeatureClick: PropTypes.func.isRequired,
            onFeatureRemove: PropTypes.func.isRequired,
            features: PropTypes.array.isRequired,
            fetchFeatureToggles: PropTypes.array.isRequired,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentDidMount () {
        this.props.fetchFeatureToggles();
    }

    render () {
        const { features, onFeatureClick, onFeatureRemove } = this.props;

        return (
           <List>
                <ListSubHeader caption="Feature toggles" />
                {features.map((feature, i) =>
                    <Feature key={i} feature={feature} onFeatureClick={onFeatureClick} onFeatureRemove={onFeatureRemove}/>
                )}
                <ListDivider />
                <ListItem
                    onClick={() => this.context.router.push('/features/create')}
                    caption="Add" legend="new feature toggle" leftIcon="add" />
           </List>
        );
    }
}
