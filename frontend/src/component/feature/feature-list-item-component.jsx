import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Switch, Icon, IconButton } from 'react-mdl';
import Progress from './progress';
import { shorten, calc } from '../common';

import style from './feature.scss';

const Feature = ({
    feature,
    onFeatureClick,
    onFeatureRemove,
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

    const removeToggle = () => {
        if (window.confirm('Are you sure you want to remove this toggle?')) {  // eslint-disable-line no-alert
            onFeatureRemove(name);
        }
    };

    return (
        <li key={name} className="mdl-list__item mdl-list__item--two-line">
            <span className="mdl-list__item-secondary-action">
                <div style={{ width: '40px', textAlign: 'center', marginRight: '5px' }}>
                    {
                        isStale ?
                            <Icon
                                style={{ width: '25px', marginTop: '4px', fontSize: '25px', color: '#ccc' }}
                                name="report problem" title="No metrics avaiable" /> :
                            <div>
                                <Progress strokeWidth={15} percentage={percent} width="50" />
                            </div>
                    }
                </div>
            </span>
            <span className="mdl-list__item-secondary-action" style={{ width: '45px' }} title={`Toggle ${name}`}>
                <Switch title="test" key="left-actions" onChange={() => onFeatureClick(feature)} checked={enabled} />
            </span>
            <span className="mdl-list__item-primary-content">
                <Link to={`/features/view/${name}`} className={style.link} style={{ display: 'inline-block', width: '100%' }}>
                    {shorten(name, 75)} <small className={[style.hideLt960, 'mdl-list__item-sub-title'].join(' ')}>{shorten(description, 75) || ''}</small>
                </Link>
            </span>

            <span className="mdl-list__item-secondary-action">
                {strategies && strategies.map((s, i) => <span className={[style.iconListItemChip, style.hideLt960].join(' ')} key={i}>
                    {s.name}
                </span>)}
            </span>
            <span className="mdl-list__item-secondary-action">
                <IconButton name="delete" onClick={removeToggle} className={style.iconListItem} />
            </span>
        </li>
    );
};

Feature.propTypes = {
    feature: PropTypes.object,
    onFeatureClick: PropTypes.func,
    onFeatureRemove: PropTypes.func,
};

export default Feature;
