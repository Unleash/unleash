import { memo } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Chip, ListItem, Tooltip } from '@mui/material';
import { Undo } from '@mui/icons-material';
import TimeAgo from 'react-timeago';
import { IAccessContext } from 'contexts/AccessContext';
import StatusChip from 'component/common/StatusChip/StatusChip';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { IFlags } from 'interfaces/uiConfig';
import { getTogglePath } from 'utils/routePathHelpers';
import FeatureStatus from 'component/feature/FeatureView/FeatureStatus/FeatureStatus';
import FeatureType from 'component/feature/FeatureView/FeatureType/FeatureType';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { FeatureSchema } from 'openapi';
import { styles as themeStyles } from 'component/common';
import { useStyles } from './styles';

interface IFeatureToggleListItemProps {
    feature: FeatureSchema;
    onRevive?: (id: string) => void;
    hasAccess: IAccessContext['hasAccess'];
    flags?: IFlags;
    inProject?: boolean;
    className?: string;
}

/**
 * @deprecated
 */
export const FeatureToggleListItem = memo<IFeatureToggleListItemProps>(
    ({
        feature,
        onRevive,
        hasAccess,
        flags = {},
        inProject,
        className,
        ...rest
    }) => {
        const { classes: styles } = useStyles();

        const { projects } = useProjects();
        const isArchive = Boolean(onRevive);

        const {
            name,
            description,
            type,
            stale,
            createdAt,
            project,
            lastSeenAt,
        } = feature;

        const projectExists = () => {
            let projectExist = projects.find(proj => proj.id === project);
            if (projectExist) {
                return true;
            }
            return false;
        };

        const reviveFeature = () => {
            if (projectExists() && onRevive) {
                onRevive(feature.name);
            }
        };

        return (
            <ListItem
                {...rest}
                className={classnames(styles.listItem, className)}
            >
                <span className={styles.listItemMetric}>
                    <FeatureStatus
                        lastSeenAt={lastSeenAt}
                        tooltipPlacement="left"
                    />
                </span>
                <span
                    className={classnames(
                        styles.listItemType,
                        themeStyles.hideLt600
                    )}
                >
                    <FeatureType type={type as string} />
                </span>
                <span className={classnames(styles.listItemLink)}>
                    <ConditionallyRender
                        condition={!isArchive}
                        show={
                            <Link
                                to={getTogglePath(feature.project!, name)}
                                className={classnames(
                                    themeStyles.listLink,
                                    themeStyles.truncate
                                )}
                            >
                                <Tooltip title={description || ''} arrow>
                                    <span className={themeStyles.toggleName}>
                                        {name}&nbsp;
                                    </span>
                                </Tooltip>
                                {/* <span className={styles.listItemToggle}></span> */}
                                <span></span>
                                <small>
                                    <ConditionallyRender
                                        condition={Boolean(createdAt)}
                                        show={() => (
                                            <TimeAgo
                                                date={createdAt as Date}
                                                live={false}
                                            />
                                        )}
                                    />
                                </small>
                                <div>
                                    <span className={themeStyles.truncate}>
                                        <small>{description}</small>
                                    </span>
                                </div>
                            </Link>
                        }
                        elseShow={
                            <>
                                <Tooltip title={description || ''} arrow>
                                    <span className={themeStyles.toggleName}>
                                        {name}&nbsp;{' '}
                                    </span>
                                </Tooltip>
                                {/* <span className={styles.listItemToggle}></span> */}
                                <span></span>
                                <small>
                                    <ConditionallyRender
                                        condition={Boolean(createdAt)}
                                        show={() => (
                                            <TimeAgo
                                                date={createdAt as Date}
                                                live={false}
                                            />
                                        )}
                                    />
                                </small>
                                <div>
                                    <span className={themeStyles.truncate}>
                                        <small>{description}</small>
                                    </span>
                                </div>
                            </>
                        }
                    />
                </span>
                <span
                    className={classnames(
                        styles.listItemStrategies,
                        themeStyles.hideLt920
                    )}
                >
                    <StatusChip stale={Boolean(stale)} showActive={false} />
                    <ConditionallyRender
                        condition={!inProject}
                        show={
                            <Link
                                to={`/projects/${project}`}
                                style={{ textDecoration: 'none' }}
                                className={classnames({
                                    [`${styles.disabledLink}`]:
                                        !projectExists(),
                                })}
                            >
                                <Chip
                                    color="primary"
                                    variant="outlined"
                                    style={{
                                        marginLeft: '8px',
                                        cursor: 'pointer',
                                    }}
                                    title={`Project: ${project}`}
                                    label={project}
                                />
                            </Link>
                        }
                    />
                </span>
                <ConditionallyRender
                    condition={isArchive}
                    show={
                        <PermissionIconButton
                            permission={UPDATE_FEATURE}
                            projectId={project}
                            disabled={
                                !hasAccess(UPDATE_FEATURE, project) ||
                                !projectExists()
                            }
                            onClick={reviveFeature}
                            tooltipProps={{ title: 'Revive feature toggle' }}
                        >
                            <Undo />
                        </PermissionIconButton>
                    }
                />
            </ListItem>
        );
    }
);
