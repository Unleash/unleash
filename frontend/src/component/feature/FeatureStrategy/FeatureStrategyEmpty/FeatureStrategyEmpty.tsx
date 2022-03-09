import NoItems from '../../../common/NoItems/NoItems';
import StringTruncator from '../../../common/StringTruncator/StringTruncator';
import { useStyles } from './FeatureStrategyEmpty.styles';
import { FeatureStrategyMenu } from '../FeatureStrategyMenu/FeatureStrategyMenu';

interface IFeatureStrategyEmptyProps {
    projectId: string;
    featureId: string;
    environmentId: string;
}

export const FeatureStrategyEmpty = ({
    projectId,
    featureId,
    environmentId,
}: IFeatureStrategyEmptyProps) => {
    const styles = useStyles();

    return (
        <NoItems>
            <p className={styles.noItemsParagraph}>
                No strategies added in the{' '}
                <StringTruncator
                    text={environmentId}
                    maxWidth={'130'}
                    className={styles.envName}
                />{' '}
                environment
            </p>
            <p className={styles.noItemsParagraph}>
                Strategies added in this environment will only be executed if
                the SDK is using an API key configured for this environment.
                <a
                    className={styles.link}
                    href="https://docs.getunleash.io/user_guide/environments"
                    target="_blank"
                    rel="noreferrer"
                >
                    Read more here
                </a>
            </p>
            <FeatureStrategyMenu
                label="Add your first strategy"
                projectId={projectId}
                featureId={featureId}
                environmentId={environmentId}
            />
        </NoItems>
    );
};
