import React, { useRef, useState } from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import { useStyles } from '../FeatureToggleListNew.styles';
import useToggleFeatureByEnv from '../../../../hooks/api/actions/useToggleFeatureByEnv/useToggleFeatureByEnv';
import { IEnvironments } from '../../../../interfaces/featureToggle';
import useToast from '../../../../hooks/useToast';
import { getTogglePath } from 'utils/routePathHelpers';
import FeatureStatus from '../../FeatureView/FeatureStatus/FeatureStatus';
import FeatureType from '../../FeatureView/FeatureType/FeatureType';
import classNames from 'classnames';
import CreatedAt from './CreatedAt';
import useProject from '../../../../hooks/api/getters/useProject/useProject';
import { UPDATE_FEATURE_ENVIRONMENT } from '../../../providers/AccessProvider/permissions';
import PermissionSwitch from '../../../common/PermissionSwitch/PermissionSwitch';
import { Link } from 'react-router-dom';
import { ENVIRONMENT_STRATEGY_ERROR } from '../../../../constants/apiErrors';
import EnvironmentStrategyDialog from '../../../common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';

interface IFeatureToggleListNewItemProps {
    name: string;
    type: string;
    environments: IEnvironments[];
    projectId: string;
    lastSeenAt?: string;
    createdAt: string;
}

const FeatureToggleListNewItem = ({
    name,
    lastSeenAt,
    type,
    environments,
    projectId,
    createdAt,
}: IFeatureToggleListNewItemProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { toggleFeatureByEnvironment } = useToggleFeatureByEnv(
        projectId,
        name
    );

    const { refetch } = useProject(projectId);
    const styles = useStyles();
    const ref = useRef<HTMLButtonElement>(null);
    const [showInfoBox, setShowInfoBox] = useState(false);
    const [environmentName, setEnvironmentName] = useState('');

    const closeInfoBox = () => {
        setShowInfoBox(false);
    };

    const handleToggle = (env: IEnvironments) => {
        toggleFeatureByEnvironment(env.name, env.enabled)
            .then(() => {
                setToastData({
                    type: 'success',
                    title: 'Updated toggle status',
                    text: 'Successfully updated toggle status.',
                });
                refetch();
            })
            .catch(e => {
                if (e.message === ENVIRONMENT_STRATEGY_ERROR) {
                    setShowInfoBox(true);
                } else {
                    setToastApiError(e.message);
                }
            });
    };

    return (
        <>
            <TableRow className={styles.tableRow}>
                <TableCell
                    className={classNames(
                        styles.tableCell,
                        styles.tableCellStatus
                    )}
                    align="left"
                >
                    <FeatureStatus
                        lastSeenAt={lastSeenAt}
                        tooltipPlacement="left"
                    />
                </TableCell>
                <TableCell
                    className={classNames(
                        styles.tableCell,
                        styles.tableCellType
                    )}
                    align="center"
                >
                    <FeatureType type={type} />
                </TableCell>
                <TableCell
                    className={classNames(
                        styles.tableCell,
                        styles.tableCellName
                    )}
                    align="left"
                >
                    <Link
                        to={getTogglePath(projectId, name)}
                        className={styles.link}
                    >
                        <span data-loading>{name}</span>
                    </Link>
                </TableCell>
                <TableCell
                    className={classNames(
                        styles.tableCell,
                        styles.tableCellCreated
                    )}
                    align="left"
                >
                    <CreatedAt time={createdAt} />
                </TableCell>

                {environments.map((env: IEnvironments) => {
                    return (
                        <TableCell
                            className={classNames(
                                styles.tableCell,
                                styles.tableCellEnv
                            )}
                            align="center"
                            key={env.name}
                        >
                            <span data-loading style={{ display: 'block' }}>
                                <PermissionSwitch
                                    checked={env.enabled}
                                    environmentId={env.name}
                                    projectId={projectId}
                                    permission={UPDATE_FEATURE_ENVIRONMENT}
                                    ref={ref}
                                    onClick={() => {
                                        handleToggle(env);
                                        setEnvironmentName(env.name);
                                    }}
                                />
                            </span>
                        </TableCell>
                    );
                })}
            </TableRow>
            <EnvironmentStrategyDialog
                open={showInfoBox}
                onClose={closeInfoBox}
                projectId={projectId}
                featureId={name}
                environmentName={environmentName}
            />
        </>
    );
};

export default FeatureToggleListNewItem;
