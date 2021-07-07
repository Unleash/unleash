import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { Checkbox } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';

import {
    pluralize,
    getDates,
    expired,
    toggleExpiryByTypeMap,
    getDiffInDays,
} from '../../utils';
import {
    KILLSWITCH,
    PERMISSION,
} from '../../../../constants/featureToggleTypes';

import styles from '../ReportToggleList.module.scss';

const ReportToggleListItem = ({
    name,
    stale,
    lastSeenAt,
    createdAt,
    type,
    checked,
    bulkActionsOn,
    setFeatures,
}) => {
    const nameMatches = feature => feature.name === name;
    const history = useHistory();

    const handleChange = () => {
        setFeatures(prevState => {
            const newState = [...prevState];

            return newState.map(feature => {
                if (nameMatches(feature)) {
                    return { ...feature, checked: !feature.checked };
                }
                return feature;
            });
        });
    };

    const formatCreatedAt = () => {
        const [date, now] = getDates(createdAt);

        const diff = getDiffInDays(date, now);
        if (diff === 0) return '1 day';

        const formatted = pluralize(diff, 'day');

        return `${formatted} ago`;
    };

    const formatExpiredAt = () => {
        if (type === KILLSWITCH || type === PERMISSION) {
            return 'N/A';
        }

        const [date, now] = getDates(createdAt);
        const diff = getDiffInDays(date, now);

        if (expired(diff, type)) {
            const result = diff - toggleExpiryByTypeMap[type];
            if (result === 0) return '1 day';

            return pluralize(result, 'day');
        }
    };

    const formatLastSeenAt = () => {
        if (!lastSeenAt) return 'Never';

        const [date, now] = getDates(lastSeenAt);
        const diff = getDiffInDays(date, now);
        if (diff === 0) return '1 day';

        if (diff) {
            return pluralize(diff, 'day');
        }

        return '1 day';
    };

    const renderStatus = (icon, text) => (
        <span className={styles.reportStatus}>
            {icon}
            {text}
        </span>
    );

    const formatReportStatus = () => {
        if (type === KILLSWITCH || type === PERMISSION) {
            return renderStatus(
                <CheckIcon className={styles.reportIcon} />,
                'Healthy'
            );
        }

        const [date, now] = getDates(createdAt);
        const diff = getDiffInDays(date, now);

        if (expired(diff, type)) {
            return renderStatus(
                <ReportProblemOutlinedIcon className={styles.reportIcon} />,
                'Potentially stale'
            );
        }

        return renderStatus(
            <CheckIcon className={styles.reportIcon} />,
            'Healthy'
        );
    };

    const navigateToFeature = () => {
        history.push(`/features/strategies/${name}`);
    };

    const statusClasses = classnames(styles.active, {
        [styles.stale]: stale,
    });

    return (
        <tr
            role="button"
            tabIndex={0}
            onClick={navigateToFeature}
            className={styles.tableRow}
        >
            <ConditionallyRender
                condition={bulkActionsOn}
                show={
                    <td>
                        <Checkbox
                            checked={checked}
                            value={checked}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                    </td>
                }
            />
            <td>{name}</td>
            <td>{formatLastSeenAt()}</td>
            <td>{formatCreatedAt()}</td>
            <td className={styles.expired}>{formatExpiredAt()}</td>
            <td className={statusClasses}>{stale ? 'Stale' : 'Active'}</td>
            <td>{formatReportStatus()}</td>
        </tr>
    );
};

ReportToggleListItem.propTypes = {
    name: PropTypes.string.isRequired,
    stale: PropTypes.bool.isRequired,
    lastSeenAt: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    bulkActionsOn: PropTypes.bool.isRequired,
    setFeatures: PropTypes.func.isRequired,
};

export default React.memo(ReportToggleListItem);
