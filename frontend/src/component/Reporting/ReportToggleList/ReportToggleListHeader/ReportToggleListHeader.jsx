import React from 'react';
import { Checkbox } from '@material-ui/core';
import UnfoldMoreOutlinedIcon from '@material-ui/icons/UnfoldMoreOutlined';
import PropTypes from 'prop-types';

import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';

import { NAME, LAST_SEEN, CREATED, EXPIRED, STATUS } from '../../constants';

import { useStyles } from '../ReportToggleList.styles';

const ReportToggleListHeader = ({
    handleCheckAll,
    checkAll,
    setSort,
    bulkActionsOn,
}) => {
    const styles = useStyles();
    const handleSort = type => {
        setSort(prev => ({
            type,
            desc: !prev.desc,
        }));
    };

    return (
        <thead>
            <tr>
                <ConditionallyRender
                    condition={bulkActionsOn}
                    show={
                        <th>
                            <Checkbox
                                onChange={handleCheckAll}
                                value={checkAll}
                                checked={checkAll}
                                className={styles.checkbox}
                            />
                        </th>
                    }
                />

                <th
                    role="button"
                    tabIndex={0}
                    style={{ width: '150px' }}
                    onClick={() => handleSort(NAME)}
                >
                    Name
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    className={styles.hideColumnLastSeen}
                    tabIndex={0}
                    onClick={() => handleSort(LAST_SEEN)}
                >
                    Last seen
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    className={styles.hideColumn}
                    onClick={() => handleSort(CREATED)}
                >
                    Created
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    className={styles.hideColumn}
                    onClick={() => handleSort(EXPIRED)}
                >
                    Expired
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    className={styles.hideColumnStatus}
                    onClick={() => handleSort(STATUS)}
                >
                    Status
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort(EXPIRED)}
                >
                    Report
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
            </tr>
        </thead>
    );
};

ReportToggleListHeader.propTypes = {
    checkAll: PropTypes.bool.isRequired,
    setSort: PropTypes.func.isRequired,
    bulkActionsOn: PropTypes.bool.isRequired,
    handleCheckAll: PropTypes.func.isRequired,
};

export default ReportToggleListHeader;
