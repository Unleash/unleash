import React, { PropTypes } from 'react';
import Feature from './Feature';
import style from './table.scss';

export default class FeatureList extends React.Component {
    constructor () {
        super();
    }

    static propTypes () {
        return {
            onFeatureClick: PropTypes.func.isRequired,
            onFeatureRemove: PropTypes.func.isRequired,
            features: PropTypes.array.isRequired,
            fetchFeatureToggles: PropTypes.array.isRequired,
        };
    }

    componentDidMount () {
        this.props.fetchFeatureToggles();
    }

    render () {
        const onFeatureClick = this.props.onFeatureClick;
        const onFeatureRemove = this.props.onFeatureRemove;
        const features = this.props.features.map(featureToggle =>
                <Feature key={featureToggle.name}
                    {...featureToggle}
                    onClick={() => onFeatureClick(featureToggle)}
                    onFeatureRemove={() => onFeatureRemove(featureToggle.name)}
                />
            );

        return (
            <table className={style.ztable}>
                <thead>
                    <tr>
                        <th width="80">Enabled</th>
                        <th>Feature Toggle</th>
                        <th>Strategies</th>
                        <th width="100" style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {features}
                </tbody>
            </table>
        );
    }
}
