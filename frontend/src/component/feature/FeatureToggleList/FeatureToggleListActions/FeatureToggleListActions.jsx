import React from 'react';
import PropTypes from 'prop-types';

import { MenuItem, Typography } from '@material-ui/core';
// import { HourglassEmpty, HourglassFull } from '@material-ui/icons';
// import { MenuItemWithIcon } from '../../../common';
import DropdownMenu from '../../../common/DropdownMenu/DropdownMenu';
import ProjectSelect from '../../../common/ProjectSelect';
import { useStyles } from './styles';
import useLoading from '../../../../hooks/useLoading';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import ConditionallyRender from '../../../common/ConditionallyRender';

const sortingOptions = [
    { type: 'name', displayName: 'Name' },
    { type: 'type', displayName: 'Type' },
    { type: 'enabled', displayName: 'Enabled' },
    { type: 'stale', displayName: 'Stale' },
    { type: 'created', displayName: 'Created' },
    { type: 'Last seen', displayName: 'Last seen' },
    { type: 'project', displayName: 'Project' },
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
    const { uiConfig } = useUiConfig();
    const ref = useLoading(loading);

    const handleSort = e => {
        const target = e.target.getAttribute('data-target');
        setSort(target);
    };

    const isDisabled = type => settings.sort === type;

    const renderSortingOptions = () =>
        sortingOptions.map(option => (
            <MenuItem
                style={{ fontSize: '14px' }}
                key={option.type}
                disabled={isDisabled(option.type)}
                data-target={option.type}
            >
                {option.displayName}
            </MenuItem>
        ));

    /*
    const renderMetricsOptions = () => [
        <MenuItemWithIcon
            style={{ fontSize: '14px' }}
            icon={HourglassEmpty}
            disabled={!settings.showLastHour}
            data-target="minute"
            label="Last minute"
            key={1}
        />,
        <MenuItemWithIcon
            style={{ fontSize: '14px' }}
            icon={HourglassFull}
            disabled={settings.showLastHour}
            data-target="hour"
            label="Last hour"
            key={2}
        />,
    ];
    */

    return (
        <div className={styles.actions} ref={ref}>
            <Typography variant="body2" data-loading>
                Sorted by:
            </Typography>
            {/* }
            <DropdownMenu
                id={'metric'}
                label={`Last ${settings.showLastHour ? 'hour' : 'minute'}`}
                title="Metric interval"
                callback={toggleMetrics}
                renderOptions={renderMetricsOptions}
                className=""
                style={{ textTransform: 'lowercase', fontWeight: 'normal' }}
                data-loading
            />
            {*/}
            <DropdownMenu
                id={'sorting'}
                label={`By ${settings.sort}`}
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
                        settings={settings}
                        updateSetting={updateSetting}
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
    settings: PropTypes.object,
    setSort: PropTypes.func,
    toggleMetrics: PropTypes.func,
    updateSetting: PropTypes.func,
    loading: PropTypes.bool,
};

export default FeatureToggleListActions;
