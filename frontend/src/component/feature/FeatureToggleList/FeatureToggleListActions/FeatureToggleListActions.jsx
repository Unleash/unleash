import React from 'react';
import PropTypes from 'prop-types';

import { MenuItem } from '@material-ui/core';
import { MenuItemWithIcon } from '../../../common';
import DropdownMenu from '../../../common/DropdownMenu/DropdownMenu';
import ProjectSelect from '../../../common/ProjectSelect';
import { useStyles } from './styles';
import useLoading from '../../../../hooks/useLoading';

const sortingOptions = [
    { type: 'name', displayName: 'Name' },
    { type: 'type', displayName: 'Type' },
    { type: 'enabled', displayName: 'Enabled' },
    { type: 'stale', displayName: 'Stale' },
    { type: 'created', displayName: 'Created' },
    { type: 'Last seen', displayName: 'Last seen' },
    { type: 'strategies', displayName: 'Strategies' },
    { type: 'metrics', displayName: 'Metrics' },
];

const FeatureToggleListActions = ({
    settings,
    setSort,
    toggleMetrics,
    updateSetting,
    loading,
}) => {
    const styles = useStyles();
    const ref = useLoading(loading);

    const handleSort = e => {
        const target = e.target.getAttribute('data-target');
        setSort(target);
    };

    const isDisabled = type => settings.sort === type;

    const renderSortingOptions = () =>
        sortingOptions.map(option => (
            <MenuItem
                key={option.type}
                disabled={isDisabled(option.type)}
                data-target={option.type}
            >
                {option.displayName}
            </MenuItem>
        ));

    const renderMetricsOptions = () => [
        <MenuItemWithIcon
            icon="hourglass_empty"
            disabled={!settings.showLastHour}
            data-target="minute"
            label="Last minute"
            key={1}
        />,
        <MenuItemWithIcon
            icon="hourglass_full"
            disabled={settings.showLastHour}
            data-target="hour"
            label="Last hour"
            key={2}
        />,
    ];

    return (
        <div className={styles.actions} ref={ref}>
            <DropdownMenu
                id={'metric'}
                label={`Last ${settings.showLastHour ? 'hour' : 'minute'}`}
                title="Metric interval"
                callback={toggleMetrics}
                renderOptions={renderMetricsOptions}
                className=""
                data-loading
            />
            <DropdownMenu
                id={'sorting'}
                label={`By ${settings.sort}`}
                callback={handleSort}
                renderOptions={renderSortingOptions}
                title="Sort by"
                className=""
                data-loading
            />
            <ProjectSelect
                settings={settings}
                updateSetting={updateSetting}
                data-loading
            />
        </div>
    );
};

FeatureToggleListActions.propTypes = {
    settings: PropTypes.object,
    setSort: PropTypes.func,
    toggleMetrics: PropTypes.func,
    updateSetting: PropTypes.func,
    loading: PropTypes.bool,
};

export default FeatureToggleListActions;
