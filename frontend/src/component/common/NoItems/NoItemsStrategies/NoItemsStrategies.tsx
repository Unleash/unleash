import { UPDATE_FEATURE } from '../../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../ConditionallyRender';
import PermissionButton from '../../PermissionButton/PermissionButton';
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
                No strategies added in the {envName} environment
            </p>

            <p className={styles.noItemsParagraph}>
                Strategies added in this environment will only be executed if
                the SDK is using an API key configured for this environment.
                <a
                    className={styles.link}
                    href="https://docs.getunleash.io/user_guide/environments"
                >
                    Read more here
                </a>
            </p>

            <ConditionallyRender
                condition={Boolean(onClick)}
                show={
                    <PermissionButton
                        variant="contained"
                        permission={UPDATE_FEATURE}
                        projectId={projectId}
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
