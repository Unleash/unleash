import { IconButton, Tooltip } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import classNames from 'classnames';
import { useContext } from 'react';
import { useDrag } from 'react-dnd';
import { useParams } from 'react-router-dom';
import AccessContext from '../../../../../../contexts/AccessContext';
import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import useStrategies from '../../../../../../hooks/api/getters/useStrategies/useStrategies';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import { ADD_NEW_STRATEGY_CARD_BUTTON_ID } from '../../../../../../testIds';
import { getStrategyObject } from '../../../../../../utils/get-strategy-object';
import {
    getFeatureStrategyIcon,
    getHumanReadableStrategyName,
} from '../../../../../../utils/strategy-names';
import { CREATE_FEATURE_STRATEGY } from '../../../../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import { useStyles } from './FeatureStrategyCard.styles';
import PermissionIconButton from '../../../../../common/PermissionIconButton/PermissionIconButton';

interface IFeatureStrategyCardProps {
    name: string;
    description: string;
    configureNewStrategy: boolean;
    index: number;
}

export const FEATURE_STRATEGIES_DRAG_TYPE = 'FEATURE_STRATEGIES_DRAG_TYPE';

const FeatureStrategyCard = ({
    name,
    description,
    configureNewStrategy,
    index,
}: IFeatureStrategyCardProps) => {
    const { featureId, projectId } = useParams<IFeatureViewParams>();
    const { strategies } = useStrategies();

    const { setConfigureNewStrategy, setExpandedSidebar, activeEnvironment } =
        useContext(FeatureStrategiesUIContext);
    const { hasAccess } = useContext(AccessContext);
    const handleClick = () => {
        const strategy = getStrategyObject(strategies, name, featureId);
        if (!strategy) return;
        setConfigureNewStrategy(strategy);
        setExpandedSidebar(false);
    };

    const styles = useStyles();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, drag] = useDrag({
        type: FEATURE_STRATEGIES_DRAG_TYPE,
        canDrag: hasAccess(
            CREATE_FEATURE_STRATEGY,
            projectId,
            activeEnvironment?.name
        ),
        item: () => {
            return { name };
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const readableName = getHumanReadableStrategyName(name);
    const Icon = getFeatureStrategyIcon(name);

    const classes = classNames(styles.featureStrategyCard);

    return (
        <>
            <ConditionallyRender
                condition={!configureNewStrategy}
                show={
                    <div className={classes} ref={drag}>
                        <div className={styles.leftSection}>
                            <div className={styles.iconContainer}>
                                {<Icon className={styles.icon} />}
                            </div>
                        </div>
                        <div className={styles.rightSection}>
                            <PermissionIconButton
                                className={styles.addButton}
                                onClick={handleClick}
                                data-test={`${ADD_NEW_STRATEGY_CARD_BUTTON_ID}-${
                                    index + 1
                                }`}
                                permission={CREATE_FEATURE_STRATEGY}
                                projectId={projectId}
                                environmentId={activeEnvironment?.name}
                            >
                                <Add />
                            </PermissionIconButton>
                            <Tooltip title={readableName}>
                                <p className={styles.title}>{readableName}</p>
                            </Tooltip>
                            <p className={styles.description}>{description}</p>
                        </div>
                    </div>
                }
                elseShow={
                    <IconButton disabled className={styles.disabledButton}>
                        <Icon />
                    </IconButton>
                }
            />
        </>
    );
};

export default FeatureStrategyCard;
