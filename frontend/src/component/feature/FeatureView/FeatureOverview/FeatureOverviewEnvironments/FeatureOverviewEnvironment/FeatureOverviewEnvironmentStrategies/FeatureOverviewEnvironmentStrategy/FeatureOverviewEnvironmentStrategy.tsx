import { Edit } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { Link, useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../../../../../interfaces/params';
import { IFeatureStrategy } from '../../../../../../../../interfaces/strategy';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from '../../../../../../../../utils/strategy-names';
import PermissionIconButton from '../../../../../../../common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE_STRATEGY } from '../../../../../../../providers/AccessProvider/permissions';
import FeatureOverviewExecution from '../../../../FeatureOverviewExecution/FeatureOverviewExecution';
import { useStyles } from './FeatureOverviewEnvironmentStrategy.styles';
import { formatEditStrategyPath } from '../../../../../../FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { FeatureStrategyRemove } from 'component/feature/FeatureStrategy/FeatureStrategyRemove/FeatureStrategyRemove';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface IFeatureOverviewEnvironmentStrategyProps {
    environmentId: string;
    strategy: IFeatureStrategy;
}

const FeatureOverviewEnvironmentStrategy = ({
    environmentId,
    strategy,
}: IFeatureOverviewEnvironmentStrategyProps) => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const theme = useTheme();
    const styles = useStyles();
    const Icon = getFeatureStrategyIcon(strategy.name);
    const { parameters, constraints } = strategy;

    const editStrategyPath = formatEditStrategyPath(
        projectId,
        featureId,
        environmentId,
        strategy.id
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Icon className={styles.icon} />
                <StringTruncator
                    maxWidth="150"
                    maxLength={15}
                    text={formatStrategyName(strategy.name)}
                />
                <div className={styles.actions}>
                    <PermissionIconButton
                        permission={UPDATE_FEATURE_STRATEGY}
                        environmentId={environmentId}
                        projectId={projectId}
                        // @ts-expect-error
                        component={Link}
                        to={editStrategyPath}
                    >
                        <Edit titleAccess="Edit" />
                    </PermissionIconButton>
                    <FeatureStrategyRemove
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        strategyId={strategy.id}
                        icon
                    />
                </div>
            </div>

            <div className={styles.body}>
                <FeatureOverviewExecution
                    parameters={parameters}
                    strategy={strategy}
                    constraints={constraints}
                    percentageFill={theme.palette.grey[200]}
                />
            </div>
        </div>
    );
};

export default FeatureOverviewEnvironmentStrategy;
