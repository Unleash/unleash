import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Switch, ListItem, ListItemAction, Icon } from 'react-mdl';
import TimeAgo from 'react-timeago';
import Progress from '../progress-component';
import { UPDATE_FEATURE } from '../../../permissions';
import { calc, styles as commonStyles } from '../../common';
import Status from '../status-component';
import FeatureType from './feature-type-container';

import styles from './list.module.scss';

const Feature = ({
    feature,
    toggleFeature,
    settings,
    metricsLastHour = { yes: 0, no: 0, isFallback: true },
    metricsLastMinute = { yes: 0, no: 0, isFallback: true },
    revive,
    hasPermission,
}) => {
    const { name, description, enabled, type, stale, createdAt } = feature;
    const { showLastHour = false } = settings;
    const isStale = showLastHour ? metricsLastHour.isFallback : metricsLastMinute.isFallback;
    const percent =
        1 *
        (showLastHour
            ? calc(metricsLastHour.yes, metricsLastHour.yes + metricsLastHour.no, 0)
            : calc(metricsLastMinute.yes, metricsLastMinute.yes + metricsLastMinute.no, 0));
    const featureUrl = toggleFeature === undefined ? `/archive/strategies/${name}` : `/features/strategies/${name}`;
    return (
        <ListItem twoLine>
            <span className={styles.listItemMetric}>
                <Progress strokeWidth={15} percentage={percent} isFallback={isStale} />
            </span>
            <span className={styles.listItemToggle}>
                {hasPermission(UPDATE_FEATURE) ? (
                    <Switch
                        disabled={toggleFeature === undefined}
                        title={`Toggle ${name}`}
                        key="left-actions"
                        onChange={() => toggleFeature(!enabled, name)}
                        checked={enabled}
                    />
                ) : (
                    <Switch disabled title={`Toggle ${name}`} key="left-actions" checked={enabled} />
                )}
            </span>
            <span className={['mdl-list__item-primary-content', styles.listItemLink].join(' ')}>
                <Link to={featureUrl} className={[commonStyles.listLink, commonStyles.truncate].join(' ')}>
                    <span className={commonStyles.toggleName}>{name}&nbsp;</span>
                    <small className="mdl-color-text--blue-grey-300">
                        <TimeAgo date={createdAt} live={false} />
                    </small>
                    <div className="mdl-list__item-sub-title">
                        <span className={commonStyles.truncate}>{description}</span>
                    </div>
                </Link>
            </span>
            <span className={[styles.listItemStrategies, commonStyles.hideLt920].join(' ')}>
                <Status stale={stale} showActive={false} />
                <FeatureType type={type} />
            </span>
            {revive && hasPermission(UPDATE_FEATURE) ? (
                <ListItemAction onClick={() => revive(feature.name)}>
                    <Icon name="undo" />
                </ListItemAction>
            ) : (
                <span />
            )}
        </ListItem>
    );
};

Feature.propTypes = {
    feature: PropTypes.object,
    toggleFeature: PropTypes.func,
    settings: PropTypes.object,
    metricsLastHour: PropTypes.object,
    metricsLastMinute: PropTypes.object,
    revive: PropTypes.func,
    hasPermission: PropTypes.func.isRequired,
};

export default memo(Feature);
