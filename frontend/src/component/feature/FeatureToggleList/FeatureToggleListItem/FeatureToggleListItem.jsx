import React, { memo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { Link } from 'react-router-dom';
import { Switch, Icon, IconButton, ListItem } from '@material-ui/core';
import TimeAgo from 'react-timeago';
import Progress from '../../ProgressWheel';
import Status from '../../status-component';
import FeatureToggleListItemChip from './FeatureToggleListItemChip';
import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';

import { UPDATE_FEATURE } from '../../../AccessProvider/permissions';
import { calc, styles as commonStyles } from '../../../common';

import { useStyles } from './styles';

const FeatureToggleListItem = ({
    feature,
    toggleFeature,
    settings,
    metricsLastHour = { yes: 0, no: 0, isFallback: true },
    metricsLastMinute = { yes: 0, no: 0, isFallback: true },
    revive,
    hasAccess,
    ...rest
}) => {
    const styles = useStyles();

    const {
        name,
        description,
        enabled,
        type,
        stale,
        createdAt,
        project,
    } = feature;
    const { showLastHour = false } = settings;
    const isStale = showLastHour
        ? metricsLastHour.isFallback
        : metricsLastMinute.isFallback;
    const percent =
        1 *
        (showLastHour
            ? calc(
                  metricsLastHour.yes,
                  metricsLastHour.yes + metricsLastHour.no,
                  0
              )
            : calc(
                  metricsLastMinute.yes,
                  metricsLastMinute.yes + metricsLastMinute.no,
                  0
              ));
    const featureUrl =
        toggleFeature === undefined
            ? `/archive/strategies/${name}`
            : `/features/strategies/${name}`;

    return (
        <ListItem
            {...rest}
            className={classnames(styles.listItem, rest.className)}
        >
            <span className={styles.listItemMetric}>
                <Progress
                    strokeWidth={15}
                    percentage={percent}
                    isFallback={isStale}
                />
            </span>
            <span className={styles.listItemToggle}>
                <ConditionallyRender
                    condition={hasAccess(UPDATE_FEATURE, project)}
                    show={
                        <Switch
                            disabled={toggleFeature === undefined}
                            title={`Toggle ${name}`}
                            key="left-actions"
                            onChange={() => toggleFeature(!enabled, name)}
                            checked={enabled}
                        />
                    }
                    elseShow={
                        <Switch
                            disabled
                            title={`Toggle ${name}`}
                            key="left-actions"
                            checked={enabled}
                        />
                    }
                />
            </span>
            <span className={classnames(styles.listItemLink)}>
                <Link
                    to={featureUrl}
                    className={classnames(
                        commonStyles.listLink,
                        commonStyles.truncate
                    )}
                >
                    <span className={commonStyles.toggleName}>
                        {name}&nbsp;
                    </span>
                    <small>
                        <TimeAgo date={createdAt} live={false} />
                    </small>
                    <div>
                        <span className={commonStyles.truncate}>
                            <small>{description}</small>
                        </span>
                    </div>
                </Link>
            </span>
            <span
                className={classnames(
                    styles.listItemStrategies,
                    commonStyles.hideLt920
                )}
            >
                <Status stale={stale} showActive={false} />
                <FeatureToggleListItemChip type={type} />
            </span>
            <ConditionallyRender
                condition={revive && hasAccess(UPDATE_FEATURE, project)}
                show={
                    <IconButton onClick={() => revive(feature.name)}>
                        <Icon>undo</Icon>
                    </IconButton>
                }
                elseShow={<span />}
            />
        </ListItem>
    );
};

FeatureToggleListItem.propTypes = {
    feature: PropTypes.object,
    toggleFeature: PropTypes.func,
    settings: PropTypes.object,
    metricsLastHour: PropTypes.object,
    metricsLastMinute: PropTypes.object,
    revive: PropTypes.func,
    hasAccess: PropTypes.func.isRequired,
};

export default memo(FeatureToggleListItem);
