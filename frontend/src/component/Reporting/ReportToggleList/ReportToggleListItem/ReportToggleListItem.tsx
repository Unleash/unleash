import { memo, ReactNode } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Checkbox } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import FeatureStatus from 'component/feature/FeatureView/FeatureStatus/FeatureStatus';
import {
    pluralize,
    getDates,
    expired,
    toggleExpiryByTypeMap,
    getDiffInDays,
} from 'component/Reporting/utils';
import { KILLSWITCH, PERMISSION } from 'constants/featureToggleTypes';
import { useStyles } from '../ReportToggleList.styles';
import { getTogglePath } from 'utils/routePathHelpers';

interface IReportToggleListItemProps {
    name: string;
    stale: boolean;
    project: string;
    lastSeenAt?: string;
    createdAt: string;
    type: string;
    checked: boolean;
    bulkActionsOn: boolean;
    setFeatures: () => void;
}

export const ReportToggleListItem = memo<IReportToggleListItemProps>(
    ({
        name,
        stale,
        lastSeenAt,
        createdAt,
        project,
        type,
        checked,
        bulkActionsOn,
        setFeatures,
    }) => {
        const styles = useStyles();
        const nameMatches = (feature: { name: string }) =>
            feature.name === name;

        const handleChange = () => {
            // @ts-expect-error
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
            return 'N/A';
        };

        const formatLastSeenAt = () => {
            return (
                <FeatureStatus
                    lastSeenAt={lastSeenAt}
                    tooltipPlacement="bottom"
                />
            );
        };

        const renderStatus = (icon: ReactNode, text: ReactNode) => (
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

        const statusClasses = classnames(
            styles.active,
            styles.hideColumnStatus,
            {
                [styles.stale]: stale,
            }
        );

        return (
            <tr className={styles.tableRow}>
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
                <td>
                    <Link
                        to={getTogglePath(project, name)}
                        className={styles.link}
                    >
                        {name}
                    </Link>
                </td>
                <td className={styles.hideColumnLastSeen}>
                    {formatLastSeenAt()}
                </td>
                <td className={styles.hideColumn}>{formatCreatedAt()}</td>
                <td className={`${styles.expired} ${styles.hideColumn}`}>
                    {formatExpiredAt()}
                </td>
                <td className={statusClasses}>{stale ? 'Stale' : 'Active'}</td>
                <td>{formatReportStatus()}</td>
            </tr>
        );
    }
);
