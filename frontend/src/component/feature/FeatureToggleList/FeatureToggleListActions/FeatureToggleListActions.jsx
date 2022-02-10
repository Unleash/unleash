import React from 'react';
import PropTypes from 'prop-types';

import { MenuItem, Typography } from '@material-ui/core';
import DropdownMenu from '../../../common/DropdownMenu/DropdownMenu';
import ProjectSelect from '../../../common/ProjectSelect/ProjectSelect';
import { useStyles } from './styles';
import useLoading from '../../../../hooks/useLoading';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { createFeaturesFilterSortOptions } from '../../../../hooks/useFeaturesSort';

const sortOptions = createFeaturesFilterSortOptions();

const FeatureToggleListActions = ({
    filter,
    setFilter,
    sort,
    setSort,
    loading,
}) => {
    const styles = useStyles();
    const { uiConfig } = useUiConfig();
    const ref = useLoading(loading);

    const handleSort = e => {
        const type = e.target.getAttribute('data-target')?.trim();
        type && setSort(prev => ({ ...prev, type }));
    };

    const isDisabled = s => s === sort.type;
    const selectedOption =
        sortOptions.find(o => o.type === sort.type) || sortOptions[0];

    const renderSortingOptions = () =>
        sortOptions.map(option => (
            <MenuItem
                style={{ fontSize: '14px' }}
                key={option.type}
                disabled={isDisabled(option.type)}
                data-target={option.type}
            >
                {option.name}
            </MenuItem>
        ));

    return (
        <div className={styles.actions} ref={ref}>
            <Typography variant="body2" data-loading>
                Sorted by:
            </Typography>
            <DropdownMenu
                id={'sorting'}
                label={`By ${selectedOption.name}`}
                callback={handleSort}
                renderOptions={renderSortingOptions}
                title="Sort by"
                className=""
                style={{ textTransform: 'lowercase', fontWeight: 'normal' }}
                data-loading
            />
            <ConditionallyRender
                condition={uiConfig.flags.P}
                show={
                    <ProjectSelect
                        currentProjectId={filter.project}
                        updateCurrentProject={project =>
                            setFilter(prev => ({ ...prev, project }))
                        }
                        style={{
                            textTransform: 'lowercase',
                            fontWeight: 'normal',
                        }}
                        data-loading
                    />
                }
            />
        </div>
    );
};

FeatureToggleListActions.propTypes = {
    filter: PropTypes.object,
    setFilter: PropTypes.func,
    sort: PropTypes.object,
    setSort: PropTypes.func,
    toggleMetrics: PropTypes.func,
    loading: PropTypes.bool,
};

export default FeatureToggleListActions;
