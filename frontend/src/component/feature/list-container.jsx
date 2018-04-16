import { connect } from 'react-redux';
import { toggleFeature, fetchFeatureToggles } from '../../store/feature-actions';
import { updateSettingForGroup } from '../../store/settings/actions';

import FeatureListComponent from './list-component';
import { logoutUser } from '../../store/user/actions';

export const mapStateToPropsConfigurable = isFeature => state => {
    const featureMetrics = state.featureMetrics.toJS();
    const settings = state.settings.toJS().feature || {};
    let features = isFeature ? state.features.toJS() : state.archive.get('list').toArray();
    if (settings.filter) {
        try {
            const regex = new RegExp(settings.filter, 'i');
            features = features.filter(
                feature =>
                    regex.test(feature.name) ||
                    regex.test(feature.description) ||
                    feature.strategies.some(s => s && s.name && regex.test(s.name))
            );
        } catch (e) {
            // Invalid filter regex
        }
    }

    if (!settings.sort) {
        settings.sort = 'name';
    }

    if (settings.sort === 'enabled') {
        features = features.sort(
            (a, b) =>
                // eslint-disable-next-line
            a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1
        );
    } else if (settings.sort === 'created') {
        features = features.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1));
    } else if (settings.sort === 'name') {
        features = features.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
    } else if (settings.sort === 'strategies') {
        features = features.sort((a, b) => (a.strategies.length > b.strategies.length ? -1 : 1));
    } else if (settings.sort === 'metrics') {
        const target = settings.showLastHour ? featureMetrics.lastHour : featureMetrics.lastMinute;

        features = features.sort((a, b) => {
            if (!target[a.name]) {
                return 1;
            }
            if (!target[b.name]) {
                return -1;
            }
            if (target[a.name].yes > target[b.name].yes) {
                return -1;
            }
            return 1;
        });
    }

    return {
        features,
        featureMetrics,
        settings,
    };
};
const mapStateToProps = mapStateToPropsConfigurable(true);
const mapDispatchToProps = {
    logoutUser,
    toggleFeature,
    fetchFeatureToggles,
    updateSetting: updateSettingForGroup('feature'),
};

const FeatureListContainer = connect(mapStateToProps, mapDispatchToProps)(FeatureListComponent);

export default FeatureListContainer;
