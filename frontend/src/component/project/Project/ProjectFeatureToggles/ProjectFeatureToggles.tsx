import { Button, IconButton } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { IFeatureToggleListItem } from '../../../../interfaces/featureToggle';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { PROJECTFILTERING } from '../../../common/flags';
import HeaderTitle from '../../../common/HeaderTitle';
import PageContent from '../../../common/PageContent';
import FeatureToggleListNew from '../../../feature/FeatureToggleListNew/FeatureToggleListNew';
import { useStyles } from './ProjectFeatureToggles.styles';

interface IProjectFeatureToggles {
    features: IFeatureToggleListItem[];
    loading: boolean;
}

const ProjectFeatureToggles = ({
    features,
    loading,
}: IProjectFeatureToggles) => {
    const styles = useStyles();
    const { id } = useParams();

    return (
        <PageContent
            className={styles.container}
            headerContent={
                <HeaderTitle
                    className={styles.title}
                    title="Feature toggles"
                    actions={
                        <>
                            <ConditionallyRender
                                condition={PROJECTFILTERING}
                                show={
                                    <IconButton
                                        className={styles.iconButton}
                                        data-loading
                                    >
                                        <FilterListIcon
                                            className={styles.icon}
                                        />
                                    </IconButton>
                                }
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to="/features/create"
                                data-loading
                            >
                                New feature toggle
                            </Button>
                        </>
                    }
                />
            }
        >
            <FeatureToggleListNew
                features={features}
                loading={loading}
                projectId={id}
            />
        </PageContent>
    );
};

export default ProjectFeatureToggles;
