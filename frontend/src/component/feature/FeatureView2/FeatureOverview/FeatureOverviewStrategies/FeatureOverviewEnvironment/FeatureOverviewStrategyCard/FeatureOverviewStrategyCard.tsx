import { useMediaQuery } from '@material-ui/core';
import { IFeatureStrategy } from '../../../../../../../interfaces/strategy';
import {
    getFeatureStrategyIcon,
    getHumanReadbleStrategyName,
} from '../../../../../../../utils/strategy-names';
import ConditionallyRender from '../../../../../../common/ConditionallyRender';
import { useStyles } from './FeatureOverviewStrategyCard.styles';

interface IFeatureOverviewStrategyCardProps {
    strategy: IFeatureStrategy;
    onClick: () => void;
}

const FeatureOverviewStrategyCard = ({
    strategy,
    onClick,
}: IFeatureOverviewStrategyCardProps) => {
    const styles = useStyles();
    const smallScreen = useMediaQuery('(max-width:500px)');
    const strategyName = getHumanReadbleStrategyName(strategy.name);
    const Icon = getFeatureStrategyIcon(strategy.name);

    const { parameters } = strategy;
    return (
        <button className={styles.card} onClick={onClick}>
            <Icon className={styles.icon} data-loading />
            <p data-loading className={styles.cardHeader}>
                {strategyName}
            </p>

            <ConditionallyRender
                condition={Boolean(parameters?.rollout) && !smallScreen}
                show={
                    <p className={styles.rollout} data-loading>
                        Rolling out to {parameters?.rollout}%
                    </p>
                }
            />
        </button>
    );
};

export default FeatureOverviewStrategyCard;
