import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Switch, Chip, ListItem } from 'react-mdl';
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
            <Chip className={styles.strategyChip} key={i}>{s.name}</Chip>);
    const summaryChip = remainingStrategies > 0 &&
            <Chip className={styles.strategyChip}>+{remainingStrategies}</Chip>;

    return (
        <ListItem twoLine>
            <span className={styles.listItemMetric}>
                <Progress strokeWidth={15} percentage={percent} isFallback={isStale}/>
            </span>
            <span className={styles.listItemToggle}>
                <Switch title={`Toggle ${name}`} key="left-actions" onChange={() => toggleFeature(name)} checked={enabled} />
            </span>
            <span className={['mdl-list__item-primary-content', styles.listItemLink].join(' ')}>
                <Link to={`/features/view/${name}`} className={[commonStyles.listLink, commonStyles.truncate].join(' ')}>
                    {name}
                    <span className={['mdl-list__item-sub-title', commonStyles.truncate].join(' ')}>{description}</span>
                </Link>
            </span>
            <span className={[styles.listItemStrategies, commonStyles.hideLt920].join(' ')}>
                {strategyChips}
                {summaryChip}
            </span>
        </ListItem>
    );
};

Feature.propTypes = {
    feature: PropTypes.object,
    toggleFeature: PropTypes.func,
    settings: PropTypes.object,
    metricsLastHour: PropTypes.object,
    metricsLastMinute: PropTypes.object,
};

export default Feature;
