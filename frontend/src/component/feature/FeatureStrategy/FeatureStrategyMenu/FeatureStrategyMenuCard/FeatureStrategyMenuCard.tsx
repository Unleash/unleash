import { IStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { useStyles } from './FeatureStrategyMenuCard.styles';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import { formatCreateStrategyPath } from '../../FeatureStrategyCreate/FeatureStrategyCreate';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface IFeatureStrategyMenuCardProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: IStrategy;
}

export const FeatureStrategyMenuCard = ({
    projectId,
    featureId,
    environmentId,
    strategy,
}: IFeatureStrategyMenuCardProps) => {
    const styles = useStyles();
    const StrategyIcon = getFeatureStrategyIcon(strategy.name);
    const strategyName = formatStrategyName(strategy.name);

    const createStrategyPath = formatCreateStrategyPath(
        projectId,
        featureId,
        environmentId,
        strategy.name
    );

    return (
        <Link to={createStrategyPath} className={styles.card}>
            <div className={styles.icon}>
                <StrategyIcon aria-hidden />
            </div>
            <div>
                <StringTruncator
                    text={strategy.displayName || strategyName}
                    className={styles.name}
                    maxWidth="200"
                    maxLength={25}
                />
                <div className={styles.description}>{strategy.description}</div>
            </div>
        </Link>
    );
};
