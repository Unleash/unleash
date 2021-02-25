import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { Card, Menu, MenuItem } from 'react-mdl';
import PropTypes from 'prop-types';

import ReportToggleListItem from './report-toggle-list-item';
import ReportToggleListHeader from './report-toggle-list-header';
import ConditionallyRender from '../common/conditionally-render';

import { getObjectProperties, getCheckedState, applyCheckedToFeatures } from './utils';

import useSort from './useSort';

import styles from './reporting.module.scss';
import { DropdownButton } from '../common';

/* FLAG TO TOGGLE UNFINISHED BULK ACTIONS FEATURE */
const BULK_ACTIONS_ON = false;

const ReportToggleList = ({ features, selectedProject }) => {
    const [checkAll, setCheckAll] = useState(false);
    const [localFeatures, setFeatures] = useState([]);
    const [sort, setSortData] = useSort();

    useEffect(() => {
        const formattedFeatures = features.map(feature => ({
            ...getObjectProperties(feature, 'name', 'lastSeenAt', 'createdAt', 'stale', 'type'),
            checked: getCheckedState(feature.name, features),
            setFeatures,
        }));

        setFeatures(formattedFeatures);
    }, [features, selectedProject]);

    const handleCheckAll = () => {
        if (!checkAll) {
            setCheckAll(true);
            return setFeatures(prev => applyCheckedToFeatures(prev, true));
        }
        setCheckAll(false);
        return setFeatures(prev => applyCheckedToFeatures(prev, false));
    };

    const renderListRows = () =>
        sort(localFeatures).map(feature => (
            <ReportToggleListItem key={feature.name} {...feature} bulkActionsOn={BULK_ACTIONS_ON} />
        ));

    const renderBulkActionsMenu = () => (
        <span>
            <DropdownButton
                className={classnames('mdl-button', styles.bulkAction)}
                id="bulk_actions"
                label="Bulk actions"
            />
            <Menu
                target="bulk_actions"
                /* eslint-disable-next-line  */
                onClick={() => console.log("Hi")}
                style={{ width: '168px' }}
            >
                <MenuItem>Mark toggles as stale</MenuItem>
                <MenuItem>Delete toggles</MenuItem>
            </Menu>
        </span>
    );

    return (
        <Card className={styles.reportToggleList}>
            <div className={styles.reportToggleListHeader}>
                <h3 className={styles.reportToggleListHeading}>Overview</h3>
                <ConditionallyRender condition={BULK_ACTIONS_ON} show={renderBulkActionsMenu} />
            </div>
            <div className={styles.reportToggleListInnerContainer}>
                <table className={styles.reportingToggleTable}>
                    <ReportToggleListHeader
                        handleCheckAll={handleCheckAll}
                        checkAll={checkAll}
                        setSortData={setSortData}
                        bulkActionsOn={BULK_ACTIONS_ON}
                    />

                    <tbody>{renderListRows()}</tbody>
                </table>
            </div>
        </Card>
    );
};

ReportToggleList.propTypes = {
    selectedProject: PropTypes.string.isRequired,
    features: PropTypes.array.isRequired,
};

export default ReportToggleList;
