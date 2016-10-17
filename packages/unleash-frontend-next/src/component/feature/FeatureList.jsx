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
                    onClick={() => onFeatureClick(featureToggle)}
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
