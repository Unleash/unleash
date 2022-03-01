import React, { useRef, useState } from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import { useHistory } from 'react-router';
import { useStyles } from '../FeatureToggleListNew.styles';
import useToggleFeatureByEnv from '../../../../hooks/api/actions/useToggleFeatureByEnv/useToggleFeatureByEnv';
import { IEnvironments } from '../../../../interfaces/featureToggle';
import useToast from '../../../../hooks/useToast';
import { getTogglePath } from '../../../../utils/route-path-helpers';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
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

    const { uiConfig } = useUiConfig();
    const { refetch } = useProject(projectId);
    const styles = useStyles();
    const history = useHistory();
    const ref = useRef<HTMLButtonElement>(null);
    const [showInfoBox, setShowInfoBox] = useState(false);
    const [environmentName, setEnvironmentName] = useState('');

    const closeInfoBox = () => {
        setShowInfoBox(false);
    };

    const onClick = (e: React.MouseEvent) => {
        if (!ref.current?.contains(e.target as Node)) {
            history.push(getTogglePath(projectId, name));
        }
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
                    onClick={onClick}
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
                    onClick={onClick}
                >
                    <FeatureType type={type} />
                </TableCell>
                <TableCell
                    className={classNames(
                        styles.tableCell,
                        styles.tableCellName
                    )}
                    align="left"
                    onClick={onClick}
                >
                    <Link
                        to={getTogglePath(projectId, name, uiConfig.flags.E)}
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
                    onClick={onClick}
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
