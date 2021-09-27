import { IconButton, Tooltip } from '@material-ui/core';
import classNames from 'classnames';
import { useDrag } from 'react-dnd';
import { getFeatureStrategyIcon, getHumanReadbleStrategyName } from '../../../../../../utils/strategy-names';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import { useStyles } from './FeatureStrategyCard.styles';

interface IFeatureStrategyCardProps {
    name: string;
    description: string;
    configureNewStrategy: boolean;
}

export const FEATURE_STRATEGIES_DRAG_TYPE = 'FEATURE_STRATEGIES_DRAG_TYPE';

const FeatureStrategyCard = ({
    name,
    description,
    configureNewStrategy,
}: IFeatureStrategyCardProps) => {
    const styles = useStyles();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ _ , drag] = useDrag({
        type: FEATURE_STRATEGIES_DRAG_TYPE,
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
