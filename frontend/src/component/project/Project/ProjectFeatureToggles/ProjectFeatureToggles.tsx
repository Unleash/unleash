import { useContext } from 'react';
import { IconButton } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useParams } from 'react-router';
import { Link, useHistory } from 'react-router-dom';
import AccessContext from '../../../../contexts/AccessContext';
import { IFeatureToggleListItem } from '../../../../interfaces/featureToggle';
import { getCreateTogglePath } from '../../../../utils/route-path-helpers';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { PROJECTFILTERING } from '../../../common/flags';
import HeaderTitle from '../../../common/HeaderTitle';
import PageContent from '../../../common/PageContent';
import ResponsiveButton from '../../../common/ResponsiveButton/ResponsiveButton';
import FeatureToggleListNew from '../../../feature/FeatureToggleListNew/FeatureToggleListNew';
import { useStyles } from './ProjectFeatureToggles.styles';
import { CREATE_FEATURE } from '../../../providers/AccessProvider/permissions';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';

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
    const history = useHistory();
    const { hasAccess } = useContext(AccessContext);
    const { uiConfig } = useUiConfig();

    return (
        <PageContent
            className={styles.container}
            bodyClass={styles.bodyClass}
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

                            <ResponsiveButton
                                onClick={() =>
                                    history.push(
                                        getCreateTogglePath(
                                            id,
                                            uiConfig.flags.E
                                        )
                                    )
                                }
                                maxWidth="700px"
                                tooltip="New feature toggle"
                                Icon={Add}
                                projectId={id}
                                permission={CREATE_FEATURE}
                            >
                                New feature toggle
                            </ResponsiveButton>
                        </>
                    }
                />
            }
        >
            <ConditionallyRender
                condition={features?.length > 0}
                show={
                    <FeatureToggleListNew
                        features={features}
                        loading={loading}
                        projectId={id}
                    />
                }
                elseShow={
                    <>
                        <p data-loading className={styles.noTogglesFound}>
                            No feature toggles added yet.
                        </p>
                        <ConditionallyRender
                            condition={hasAccess(CREATE_FEATURE, id)}
                            show={
                                <Link
                                    to={getCreateTogglePath(id)}
                                    className={styles.link}
                                    data-loading
                                >
                                    Add your first toggle
                                </Link>
                            }
                        />
                    </>
                }
            />
        </PageContent>
    );
};

export default ProjectFeatureToggles;
