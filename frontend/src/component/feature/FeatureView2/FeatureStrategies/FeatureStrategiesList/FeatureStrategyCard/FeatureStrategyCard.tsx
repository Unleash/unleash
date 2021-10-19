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
    getHumanReadbleStrategyName,
} from '../../../../../../utils/strategy-names';
import { UPDATE_FEATURE } from '../../../../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import { useStyles } from './FeatureStrategyCard.styles';

interface IFeatureStrategyCardProps {
    name: string;
    description: string;
    configureNewStrategy: boolean;
    index?: number;
}

export const FEATURE_STRATEGIES_DRAG_TYPE = 'FEATURE_STRATEGIES_DRAG_TYPE';

const FeatureStrategyCard = ({
    name,
    description,
    configureNewStrategy,
    index,
}: IFeatureStrategyCardProps) => {
    const { featureId } = useParams<IFeatureViewParams>();
    const { strategies } = useStrategies();

    const { setConfigureNewStrategy, setExpandedSidebar } = useContext(
        FeatureStrategiesUIContext
    );
    const { hasAccess } = useContext(AccessContext);
    const canUpdateFeature = hasAccess(UPDATE_FEATURE);

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
        canDrag: canUpdateFeature,
        item: () => {
            return { name };
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const readableName = getHumanReadbleStrategyName(name);
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
                            <IconButton
                                className={styles.addButton}
                                onClick={handleClick}
                                data-test={`${ADD_NEW_STRATEGY_CARD_BUTTON_ID}-${
                                    index + 1
                                }`}
                                disabled={!canUpdateFeature}
                            >
                                <Add />
                            </IconButton>
                            <Tooltip title={readableName}>
                                <p className={styles.title}>{readableName}</p>
                            </Tooltip>
                            <p className={styles.description}>{description}</p>
                        </div>
                    </div>
                }
                elseShow={
                    <IconButton disabled>
                        <Icon />
                    </IconButton>
                }
            />
        </>
    );
};

export default FeatureStrategyCard;
