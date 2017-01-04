import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Chip, Switch, Icon } from 'react-mdl';
import Progress from './progress';
import { shorten, calc, styles as commonStyles } from '../common';

import styles from './feature.scss';

const Feature = ({
    feature,
    onFeatureClick,
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
            <span className={styles.iconListItemToggle}>
                <Switch title={`Toggle ${name}`} key="left-actions" onChange={() => onFeatureClick(feature)} checked={enabled} />
            </span>
            <span className={['mdl-list__item-primary-content', commonStyles.truncate].join(' ')}>
                <Link to={`/features/view/${name}`} className={[styles.link, commonStyles.truncate].join(' ')}>
                    {shorten(name, 75)}
                    <span className={['mdl-list__item-sub-title', commonStyles.truncate].join(' ')}>{shorten(description, 75) || ''}</span>
                </Link>
            </span>
            <span className={commonStyles.hideLt960}>
                {strategies && strategies.map((s, i) => <Chip className={styles.iconListItemChip} key={i}>
                    {s.name}
                </Chip>)}
            </span>
        </li>
    );
};

Feature.propTypes = {
    feature: PropTypes.object,
    onFeatureClick: PropTypes.func,
};

export default Feature;
