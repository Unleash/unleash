import { useContext, useMemo, useState } from 'react';
import { IconButton } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useParams } from 'react-router';
import { Link, useHistory } from 'react-router-dom';
import AccessContext from 'contexts/AccessContext';
import { SearchField } from 'component/common/SearchField/SearchField';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { PROJECTFILTERING } from 'component/common/flags';
import HeaderTitle from 'component/common/HeaderTitle';
import PageContent from 'component/common/PageContent';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import FeatureToggleListNew from 'component/feature/FeatureToggleListNew/FeatureToggleListNew';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { getCreateTogglePath } from 'utils/route-path-helpers';
import { useStyles } from './ProjectFeatureToggles.styles';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import classnames from 'classnames';

interface IProjectFeatureTogglesProps {
    features: IFeatureToggleListItem[];
    loading: boolean;
}

export const ProjectFeatureToggles = ({
    features,
    loading,
}: IProjectFeatureTogglesProps) => {
    const styles = useStyles();
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
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
            headerContent={
                <HeaderTitle
                    className={styles.title}
                    title={`Feature toggles (${filteredFeatures.length})`}
                    actions={
                        <div className={styles.actionsContainer}>
                            <SearchField
                                initialValue={filter}
                                updateValue={setFilter}
                                className={classnames(styles.search, {
                                    skeleton: loading,
                                })}
                            />
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
                                    to={getCreateTogglePath(
                                        id,
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
