import { useContext, useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import AccessContext from 'contexts/AccessContext';
import { SearchField } from 'component/common/SearchField/SearchField';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PageContent } from 'component/common/PageContent/PageContent';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import FeatureToggleListNew from 'component/feature/FeatureToggleListNew/FeatureToggleListNew';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import { useStyles } from './ProjectFeatureToggles.styles';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import classnames from 'classnames';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

interface IProjectFeatureTogglesProps {
    features: IFeatureToggleListItem[];
    loading: boolean;
}

/**
 * @deprecated
 */
export const ProjectFeatureToggles = ({
    features,
    loading,
}: IProjectFeatureTogglesProps) => {
    const { classes: styles } = useStyles();
    const projectId = useRequiredPathParam('projectId');
    const navigate = useNavigate();
    const { hasAccess } = useContext(AccessContext);
    const { uiConfig } = useUiConfig();
    const [filter, setFilter] = useState('');

    const filteredFeatures = useMemo(() => {
        const regExp = new RegExp(filter, 'i');
        return filter
            ? features.filter(feature => regExp.test(feature.name))
            : features;
    }, [features, filter]);

    return (
        <PageContent
            className={styles.container}
            bodyClass={styles.bodyClass}
            header={
                <PageHeader
                    className={styles.title}
                    title={`Project feature toggles (${filteredFeatures.length})`}
                    actions={
                        <div className={styles.actionsContainer}>
                            <SearchField
                                initialValue={filter}
                                updateValue={setFilter}
                                className={classnames(styles.search, {
                                    skeleton: loading,
                                })}
                            />

                            <ResponsiveButton
                                onClick={() =>
                                    navigate(
                                        getCreateTogglePath(
                                            projectId,
                                            uiConfig.flags.E
                                        )
                                    )
                                }
                                maxWidth="700px"
                                Icon={Add}
                                projectId={projectId}
                                permission={CREATE_FEATURE}
                                className={styles.button}
                            >
                                New feature toggle
                            </ResponsiveButton>
                        </div>
                    }
                />
            }
        >
            <ConditionallyRender
                condition={filteredFeatures.length > 0}
                show={
                    <FeatureToggleListNew
                        features={filteredFeatures}
                        loading={loading}
                        projectId={projectId}
                    />
                }
                elseShow={
                    <>
                        <p data-loading className={styles.noTogglesFound}>
                            No feature toggles added yet.
                        </p>
                        <ConditionallyRender
                            condition={hasAccess(CREATE_FEATURE, projectId)}
                            show={
                                <Link
                                    to={getCreateTogglePath(
                                        projectId,
                                        uiConfig.flags.E
                                    )}
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
