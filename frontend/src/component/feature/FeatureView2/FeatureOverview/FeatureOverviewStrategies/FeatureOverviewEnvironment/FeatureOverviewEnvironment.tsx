import { Cloud } from '@material-ui/icons';
import { IFeatureEnvironment } from '../../../../../../interfaces/featureToggle';
import { Switch } from '@material-ui/core';
import { useStyles } from './FeatureOverviewEnvironment.styles';
import FeatureOverviewStrategyCard from './FeatureOverviewStrategyCard/FeatureOverviewStrategyCard';
import classNames from 'classnames';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import useFeatureApi from '../../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { useHistory, useParams, Link } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../../../interfaces/params';
import useToast from '../../../../../../hooks/useToast';

interface IFeatureOverviewEnvironmentProps {
    env: IFeatureEnvironment;
    refetch: () => void;
}

const FeatureOverviewEnvironment = ({
    env,
    refetch,
}: IFeatureOverviewEnvironmentProps) => {
    const { featureId, projectId } = useParams<IFeatureViewParams>();
    const { toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const styles = useStyles();
    const { toast, setToastData } = useToast();
    const history = useHistory();

    console.log(env);

    const handleClick = () => {
        history.push(
            `/projects/${projectId}/features2/${featureId}/strategies?environment=${env.name}`
        );
    };

    const renderStrategies = () => {
        const { strategies } = env;

        return strategies.map(strategy => {
            return (
                <FeatureOverviewStrategyCard
                    strategy={strategy}
                    key={strategy.id}
                    onClick={handleClick}
                />
            );
        });
    };

    const handleToggleEnvironmentOn = async () => {
        try {
            await toggleFeatureEnvironmentOn(projectId, featureId, env.name);
            setToastData({
                type: 'success',
                show: true,
                text: 'Successfully turned environment on.',
            });
            refetch();
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    const handleToggleEnvironmentOff = async () => {
        try {
            await toggleFeatureEnvironmentOff(projectId, featureId, env.name);
            setToastData({
                type: 'success',
                show: true,
                text: 'Successfully turned environment off.',
            });
            refetch();
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    const toggleEnvironment = (e: React.ChangeEvent) => {
        if (env.enabled) {
            handleToggleEnvironmentOff();
            return;
        }
        handleToggleEnvironmentOn();
    };

    const iconContainerClasses = classNames(styles.iconContainer, {
        [styles.disabledIconContainer]: !env.enabled,
    });

    const iconClasses = classNames(styles.icon, {
        [styles.iconDisabled]: !env.enabled,
    });

    const headerClasses = classNames(styles.header, {
        [styles.headerDisabledEnv]: !env.enabled,
    });

    const environmentIdentifierClasses = classNames(
        styles.environmentIdentifier,
        { [styles.disabledEnvContainer]: !env.enabled }
    );

    return (
        <div className={styles.container}>
            <div className={environmentIdentifierClasses}>
                <div className={iconContainerClasses}>
                    <Cloud className={iconClasses} />
                </div>
                <p className={styles.environmentBadgeParagraph}>{env.type}</p>
            </div>

            <div className={headerClasses}>
                <div className={styles.headerInfo}>
                    <p className={styles.environmentTitle}>{env.name}</p>
                </div>
                <div className={styles.environmentStatus}>
                    <ConditionallyRender
                        condition={env.strategies.length > 0}
                        show={
                            <>
                                <Switch
                                    value={env.enabled}
                                    checked={env.enabled}
                                    onChange={toggleEnvironment}
                                />{' '}
                                <span className={styles.toggleText}>
                                    This environment is{' '}
                                    {env.enabled ? 'enabled' : 'disabled'}
                                </span>
                            </>
                        }
                        elseShow={
                            <>
                                <p className={styles.toggleText}>
                                    No strategies configured for environment.
                                </p>
                                <Link
                                    to={`/projects/${projectId}/features2/${featureId}/strategies?addStrategy=true&environment=${env.name}`}
                                    className={styles.toggleLink}
                                >
                                    Configure strategies for {env.name}
                                </Link>
                            </>
                        }
                    />
                </div>
            </div>

            <ConditionallyRender
                condition={env.enabled}
                show={
                    <div className={styles.body}>
                        <div className={styles.strategiesContainer}>
                            {renderStrategies()}
                        </div>
                    </div>
                }
            />
            {toast}
        </div>
    );
};

export default FeatureOverviewEnvironment;
