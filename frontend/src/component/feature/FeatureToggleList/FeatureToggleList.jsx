import { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Button, IconButton, List, ListItem, Tooltip } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Add } from '@material-ui/icons';

import FeatureToggleListItem from './FeatureToggleListItem';
import SearchField from '../../common/SearchField/SearchField';
import FeatureToggleListActions from './FeatureToggleListActions';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import PageContent from '../../common/PageContent/PageContent';
import HeaderTitle from '../../common/HeaderTitle';

import loadingFeatures from './loadingFeatures';

import { CREATE_FEATURE } from '../../providers/AccessProvider/permissions';

import AccessContext from '../../../contexts/AccessContext';

import { useStyles } from './styles';
import ListPlaceholder from '../../common/ListPlaceholder/ListPlaceholder';
import { getCreateTogglePath } from '../../../utils/route-path-helpers';
import { NAVIGATE_TO_CREATE_FEATURE } from '../../../testIds';
import { resolveFilteredProjectId } from '../../../hooks/useFeaturesFilter';

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
    const styles = useStyles();
    const smallScreen = useMediaQuery('(max-width:800px)');
    const mobileView = useMediaQuery('(max-width:600px)');

    const setFilterQuery = v => {
        const query = v && typeof v === 'string' ? v.trim() : '';
        setFilter(prev => ({ ...prev, query }));
    };

    const resolvedProjectId = resolveFilteredProjectId(filter);
    const createURL = getCreateTogglePath(resolvedProjectId, flags.E);

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
                            <ListPlaceholder
                                text="No features available. Get started by adding a
                                new feature toggle."
                                link={createURL}
                                linkText="Add your first toggle"
                            />
                        }
                    />
                }
            />
        );
    };

    const headerTitle = archive ? 'Archived Features' : 'Features';

    return (
        <div className={styles.featureContainer}>
            <div className={styles.searchBarContainer}>
                <SearchField
                    initialValue={filter.query}
                    updateValue={setFilterQuery}
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
                                        <ConditionallyRender
                                            condition={smallScreen}
                                            show={
                                                <Tooltip title="Create feature toggle">
                                                    <IconButton
                                                        component={Link}
                                                        to={createURL}
                                                        data-test={
                                                            NAVIGATE_TO_CREATE_FEATURE
                                                        }
                                                        disabled={
                                                            !hasAccess(
                                                                CREATE_FEATURE,
                                                                resolvedProjectId
                                                            )
                                                        }
                                                    >
                                                        <Add />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            elseShow={
                                                <Button
                                                    to={createURL}
                                                    color="primary"
                                                    variant="contained"
                                                    component={Link}
                                                    data-test={
                                                        NAVIGATE_TO_CREATE_FEATURE
                                                    }
                                                    disabled={
                                                        !hasAccess(
                                                            CREATE_FEATURE,
                                                            resolvedProjectId
                                                        )
                                                    }
                                                    className={classnames({
                                                        skeleton: loading,
                                                    })}
                                                >
                                                    Create feature toggle
                                                </Button>
                                            }
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
