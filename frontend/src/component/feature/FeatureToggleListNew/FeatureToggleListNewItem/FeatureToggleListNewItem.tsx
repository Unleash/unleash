import { useRef } from 'react';
import {
    Switch,
    TableCell,
    TableRow,
    useMediaQuery,
    useTheme,
} from '@material-ui/core';
import { useHistory } from 'react-router';
import { getFeatureTypeIcons } from '../../../../utils/get-feature-type-icons';
import { useStyles } from '../FeatureToggleListNew.styles';
import useToggleFeatureByEnv from '../../../../hooks/api/actions/useToggleFeatureByEnv/useToggleFeatureByEnv';
import { IEnvironments } from '../../../../interfaces/featureToggle';
import ConditionallyRender from '../../../common/ConditionallyRender';
import useToast from '../../../../hooks/useToast';
import { getTogglePath } from '../../../../utils/route-path-helpers';
import { SyntheticEvent } from 'react-router/node_modules/@types/react';

interface IFeatureToggleListNewItemProps {
    name: string;
    type: string;
    environments: IEnvironments[];
    projectId: string;
}

const FeatureToggleListNewItem = ({
    name,
    type,
    environments,
    projectId,
}: IFeatureToggleListNewItemProps) => {
    const theme = useTheme();
    const { toast, setToastData } = useToast();
    const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { toggleFeatureByEnvironment } = useToggleFeatureByEnv(
        projectId,
        name
    );

    const styles = useStyles();
    const history = useHistory();
    const ref = useRef(null);

    const onClick = (e: SyntheticEvent) => {
        if (!ref.current?.contains(e.target)) {
            history.push(getTogglePath(projectId, name));
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
            })
            .catch(e => {
                setToastData({
                    show: true,
                    type: 'error',
                    text: e.toString(),
                });
            });
    };

    const IconComponent = getFeatureTypeIcons(type);

    return (
        <>
            <TableRow className={styles.tableRow}>
                <TableCell className={styles.tableCell} align="left" onClick={onClick}>
                    <span data-loading>{name}</span>
                </TableCell>
                <ConditionallyRender
                    condition={!smallScreen}
                    show={
                        <TableCell className={styles.tableCell} align="left" onClick={onClick}>
                            <div className={styles.tableCellType}>
                                <IconComponent
                                    data-loading
                                    className={styles.icon}
                                />{' '}
                                <span data-loading>{type}</span>
                            </div>
                        </TableCell>
                    }
                />

                {environments.map((env: IEnvironments) => {
                    return (
                        <TableCell
                            className={styles.tableCell}
                            align="center"
                            key={env.name}
                        >
                            <span data-loading style={{ display: 'block' }}>
                                <Switch
                                    checked={env.enabled}
                                    ref={ref}
                                    onClick={handleToggle.bind(this, env)}
                                />
                            </span>
                        </TableCell>
                    );
                })}
            </TableRow>
            {toast}
        </>
    );
};

export default FeatureToggleListNewItem;
