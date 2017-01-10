import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Switch, Icon, Chip } from 'react-mdl';
import Progress from './progress';
import { calc, styles as commonStyles } from '../common';

import styles from './feature.scss';

const Feature = ({
    feature,
    toggleFeature,
    settings,
    metricsLastHour = { yes: 0, no: 0, isFallback: true },
    metricsLastMinute = { yes: 0, no: 0, isFallback: true },
}) => {
    const { name, description, enabled, strategies } = feature;

    const { showLastHour = false } = settings;
    const isStale = showLastHour ? metricsLastHour.isFallback : metricsLastMinute.isFallback;

    const percent = 1 * (showLastHour ?
        calc(metricsLastHour.yes, metricsLastHour.yes + metricsLastHour.no, 0) :
        calc(metricsLastMinute.yes, metricsLastMinute.yes + metricsLastMinute.no, 0)
    );

    const strategiesToShow = Math.min(strategies.length, 3);
    const remainingStrategies = strategies.length - strategiesToShow;

    const strategyChips = strategies && strategies.slice(0, strategiesToShow).map((s, i) =>
            <Chip className={styles.iconListItemChip} key={i}>{s.name}</Chip>);
    const summaryChip = remainingStrategies > 0 &&
            <Chip className={styles.iconListItemChip}>+{remainingStrategies}</Chip>;

    return (
        <li key={name} className="mdl-list__item mdl-list__item--two-line">
            <span className={styles.iconListItemProgress}>
                <div style={{ width: '40px', textAlign: 'center' }}>
                    {
                        isStale ?
                            <Icon
                                style={{ width: '25px', marginTop: '4px', fontSize: '25px', color: '#ccc' }}
                                name="report problem" title="No metrics available" /> :
                            <div>
                                <Progress strokeWidth={15} percentage={percent} width="50" />
                            </div>
                    }
                </div>
            </span>
            <span className={styles.iconListItemToggle} style={{ flexShrink: 0 }}>
                <Switch title={`Toggle ${name}`} key="left-actions" onChange={() => toggleFeature(name)} checked={enabled} />
            </span>
            <span className="mdl-list__item-primary-content" style={{ minWidth: 0 }}>
                <Link to={`/features/view/${name}`} className={[styles.link, commonStyles.truncate].join(' ')}>
                    {name}
                    <span className={['mdl-list__item-sub-title', commonStyles.truncate].join(' ')}>{description}</span>
                </Link>
            </span>
            <span className={commonStyles.hideLt960} style={{ flexShrink: 0 }}>
                {strategyChips}
                {summaryChip}
            </span>
        </li>
    );
};

Feature.propTypes = {
    feature: PropTypes.object,
    toggleFeature: PropTypes.func,
};

export default Feature;
