import React, { memo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { Link } from 'react-router-dom';
import { IconButton, ListItem } from '@material-ui/core';
import { Undo } from '@material-ui/icons';

import TimeAgo from 'react-timeago';
import Status from '../../status-component';
import FeatureToggleListItemChip from './FeatureToggleListItemChip';
import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';

import { UPDATE_FEATURE } from '../../../AccessProvider/permissions';
import { styles as commonStyles } from '../../../common';

import { useStyles } from './styles';
import { getTogglePath } from '../../../../utils/route-path-helpers';
import FeatureStatus from '../../FeatureView2/FeatureStatus/FeatureStatus';



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

    const { name, description, type, stale, createdAt, project, lastSeenAt } =
        feature;
   
    const featureUrl =
        toggleFeature === undefined
            ? `/projects/${feature.project}/archived/${name}/metrics`
            : getTogglePath(feature.project, name);

    return (
        <ListItem
            {...rest}
            className={classnames(styles.listItem, rest.className)}
        >
            <span className={styles.listItemMetric}>
                <FeatureStatus lastSeenAt={lastSeenAt} />
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
                condition={revive}
                show={
                    <ConditionallyRender
                        condition={hasAccess(UPDATE_FEATURE, project)}
                        show={
                            <IconButton onClick={() => revive(feature.name)}>
                                <Undo />
                            </IconButton>
                        }
                        elseShow={<span style={{ width: '48px ' }} />}
                    />
                }
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
