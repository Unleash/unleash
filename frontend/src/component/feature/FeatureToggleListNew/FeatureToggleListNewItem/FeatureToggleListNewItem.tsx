import { useRef, useState } from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import { useHistory } from 'react-router';

import { useStyles } from '../FeatureToggleListNew.styles';
import useToggleFeatureByEnv from '../../../../hooks/api/actions/useToggleFeatureByEnv/useToggleFeatureByEnv';
import { IEnvironments } from '../../../../interfaces/featureToggle';
import useToast from '../../../../hooks/useToast';
import { getTogglePath } from '../../../../utils/route-path-helpers';
import { SyntheticEvent } from 'react-router/node_modules/@types/react';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import FeatureStatus from '../../FeatureView2/FeatureStatus/FeatureStatus';
import FeatureType from '../../FeatureView2/FeatureType/FeatureType';
import classNames from 'classnames';
import CreatedAt from './CreatedAt';
import useProject from '../../../../hooks/api/getters/useProject/useProject';
import { UPDATE_FEATURE } from '../../../providers/AccessProvider/permissions';
import PermissionSwitch from '../../../common/PermissionSwitch/PermissionSwitch';
import { Link } from 'react-router-dom';
import { ENVIRONMENT_STRATEGY_ERROR } from '../../../../constants/apiErrors';
import EnvironmentStrategyDialog from '../../../common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';

interface IFeatureToggleListNewItemProps {
    name: string;
    type: string;
    environments: IFeatureEnvironment[];
    projectId: string;
    lastSeenAt?: Date;
    createdAt: Date;
}

const FeatureToggleListNewItem = ({
    name,
    lastSeenAt,
    type,
    environments,
    projectId,
    createdAt,
}: IFeatureToggleListNewItemProps) => {
    const { toast, setToastData } = useToast();
    const { toggleFeatureByEnvironment } = useToggleFeatureByEnv(
        projectId,
        name
    );

    const { uiConfig } = useUiConfig();
    const { refetch } = useProject(projectId);
    const styles = useStyles();
    const history = useHistory();
    const ref = useRef(null);
    const [showInfoBox, setShowInfoBox] = useState(false);
    const [environmentName, setEnvironmentName] = useState('');

    const closeInfoBox = () => {
        setShowInfoBox(false);
    };

    const onClick = (e: SyntheticEvent) => {
        if (!ref.current?.contains(e.target)) {
            history.push(getTogglePath(projectId, name, uiConfig.flags.E));
        }
    };

    const handleToggle = (env: IEnvironments, e: SyntheticEvent) => {
        toggleFeatureByEnvironment(env.name, env.enabled)
            .then(() => {
                setToastData({
                    show: true,
                    type: 'success',
                    text: 'Successfully updated toggle status.',
                });
                refetch();
            })
            .catch(e => {
                if (e.message === ENVIRONMENT_STRATEGY_ERROR) {
                    setEnvironmentName(env.name);
                    setShowInfoBox(true);
                } else {
                    setToastData({
                        show: true,
                        type: 'error',
                        text: e.message,
                    });
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
                    <FeatureStatus lastSeenAt={lastSeenAt} />
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
                                    projectId={projectId}
                                    permission={UPDATE_FEATURE}
                                    ref={ref}
                                    onClick={handleToggle.bind(this, env)}
                                />
                            </span>
                        </TableCell>
                    );
                })}
            </TableRow>
            {toast}
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
