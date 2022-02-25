import { Settings } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { Link, useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../../../../../interfaces/params';
import { IFeatureStrategy } from '../../../../../../../../interfaces/strategy';
import {
    getFeatureStrategyIcon,
    getHumanReadableStrategyName,
} from '../../../../../../../../utils/strategy-names';
import PermissionIconButton from '../../../../../../../common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE_STRATEGY } from '../../../../../../../providers/AccessProvider/permissions';
import FeatureStrategyExecution from '../../../../../FeatureStrategies/FeatureStrategyExecution/FeatureStrategyExecution';
import { useStyles } from './FeatureOverviewEnvironmentStrategy.styles';

interface IFeatureOverviewEnvironmentStrategyProps {
    strategy: IFeatureStrategy;
    environmentName: string;
}

const FeatureOverviewEnvironmentStrategy = ({
    strategy,
    environmentName,
}: IFeatureOverviewEnvironmentStrategyProps) => {
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const theme = useTheme();
    const styles = useStyles();

    const Icon = getFeatureStrategyIcon(strategy.name);

    const { parameters, constraints } = strategy;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Icon className={styles.icon} />
                {getHumanReadableStrategyName(strategy.name)}
                <div className={styles.editStrategy}>
                    <PermissionIconButton
                        permission={UPDATE_FEATURE_STRATEGY}
                        environmentId={environmentName}
                        projectId={projectId}
                        component={Link}
                        to={`/projects/${projectId}/features/${featureId}/strategies?environment=${environmentName}`}
                    >
                        <Settings />
                    </PermissionIconButton>
                </div>
            </div>

            <div className={styles.body}>
                <FeatureStrategyExecution
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
