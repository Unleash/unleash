import { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { List, ListItem } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import FeatureToggleListItem from './FeatureToggleListItem';
import { SearchField } from 'component/common/SearchField/SearchField';
import FeatureToggleListActions from './FeatureToggleListActions';
import ConditionallyRender from 'component/common/ConditionallyRender/ConditionallyRender';
import PageContent from 'component/common/PageContent/PageContent';
import HeaderTitle from 'component/common/HeaderTitle';
import loadingFeatures from './loadingFeatures';
import AccessContext from 'contexts/AccessContext';
import { useStyles } from './styles';
import ListPlaceholder from 'component/common/ListPlaceholder/ListPlaceholder';
import { CreateFeatureButton } from '../CreateFeatureButton/CreateFeatureButton';
import { useCreateFeaturePath } from '../CreateFeatureButton/useCreateFeaturePath';

const FeatureToggleList = ({
    features,
    revive,
    archive,
    loading,
    flags,
    filter,
    setFilter,
    sort,
    setSort,
}) => {
    const { hasAccess } = useContext(AccessContext);
    const createFeature = useCreateFeaturePath(filter);
    const styles = useStyles();
    const smallScreen = useMediaQuery('(max-width:800px)');
    const mobileView = useMediaQuery('(max-width:600px)');

    const setFilterQuery = v => {
        const query = v && typeof v === 'string' ? v.trim() : '';
        setFilter(prev => ({ ...prev, query }));
    };

    const renderFeatures = () => {
        features.forEach(e => {
            e.reviveName = e.name;
        });

        if (loading) {
            return loadingFeatures.map(feature => (
                <FeatureToggleListItem
                    key={feature.name}
                    feature={feature}
                    revive={revive}
                    hasAccess={hasAccess}
                    className={'skeleton'}
                    flags={flags}
                />
            ));
        }

        return (
            <ConditionallyRender
                condition={features.length > 0}
                show={features.map(feature => (
                    <FeatureToggleListItem
                        key={feature.name}
                        feature={feature}
                        revive={revive}
                        hasAccess={hasAccess}
                        flags={flags}
                    />
                ))}
                elseShow={
                    <ConditionallyRender
                        condition={archive}
                        show={
                            <ListItem className={styles.emptyStateListItem}>
                                No archived features.
                            </ListItem>
                        }
                        elseShow={
                            <ConditionallyRender
                                condition={Boolean(createFeature?.access)}
                                show={() => (
                                    <ListPlaceholder
                                        text="No features available. Get started by adding a new feature toggle."
                                        link={createFeature.path}
                                        linkText="Add your first toggle"
                                    />
                                )}
                            />
                        }
                    />
                }
            />
        );
    };

    const searchResultsHeader = filter.query
        ? `(${features.length} matches)`
        : '';

    const headerTitle = archive
        ? `Archived Features ${searchResultsHeader}`
        : `Features ${searchResultsHeader}`;

    return (
        <div className={styles.featureContainer}>
            <div className={styles.searchBarContainer}>
                <SearchField
                    initialValue={filter.query}
                    updateValue={setFilterQuery}
                    showValueChip={!mobileView}
                    className={classnames(styles.searchBar, {
                        skeleton: loading,
                    })}
                />
                <ConditionallyRender
                    condition={!mobileView && !archive}
                    show={<Link to="/archive">Archive</Link>}
                />
            </div>

            <PageContent
                headerContent={
                    <HeaderTitle
                        loading={loading}
                        title={headerTitle}
                        actions={
                            <div className={styles.actionsContainer}>
                                <ConditionallyRender
                                    condition={!smallScreen}
                                    show={
                                        <FeatureToggleListActions
                                            filter={filter}
                                            setFilter={setFilter}
                                            sort={sort}
                                            setSort={setSort}
                                            loading={loading}
                                        />
                                    }
                                />
                                <ConditionallyRender
                                    condition={!archive}
                                    show={
                                        <CreateFeatureButton
                                            filter={filter}
                                            loading={loading}
                                        />
                                    }
                                />
                            </div>
                        }
                    />
                }
            >
                <List>{renderFeatures()}</List>
            </PageContent>
        </div>
    );
};

FeatureToggleList.propTypes = {
    features: PropTypes.array.isRequired,
    revive: PropTypes.func,
    loading: PropTypes.bool,
    archive: PropTypes.bool,
    flags: PropTypes.object,
    filter: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    sort: PropTypes.object.isRequired,
    setSort: PropTypes.func.isRequired,
};

export default FeatureToggleList;
