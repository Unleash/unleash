import { CREATE_FEATURE_STRATEGY } from '../../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../ConditionallyRender';
import PermissionButton from '../../PermissionButton/PermissionButton';
import StringTruncator from '../../StringTruncator/StringTruncator';
import NoItems from '../NoItems';

import { useStyles } from './NoItemsStrategies.styles';

interface INoItemsStrategiesProps {
    envName: string;
    projectId: string;
    onClick?: () => void;
}

const NoItemsStrategies = ({
    envName,
    projectId,
    onClick,
}: INoItemsStrategiesProps) => {
    const styles = useStyles();

    return (
        <NoItems>
            <p className={styles.noItemsParagraph}>
                No strategies added in the{' '}
                <StringTruncator
                    text={envName}
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

            <ConditionallyRender
                condition={Boolean(onClick)}
                show={
                    <PermissionButton
                        // @ts-expect-error
                        variant="contained"
                        permission={CREATE_FEATURE_STRATEGY}
                        projectId={projectId}
                        environmentId={envName}
                        color="primary"
                        onClick={onClick}
                    >
                        Add your first strategy
                    </PermissionButton>
                }
            />
        </NoItems>
    );
};

export default NoItemsStrategies;
