import { Dispatch, SetStateAction, VFC } from 'react';
import { Checkbox } from '@material-ui/core';
import UnfoldMoreOutlinedIcon from '@material-ui/icons/UnfoldMoreOutlined';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ReportingSortType } from 'component/Reporting/constants';
import { useStyles } from '../ReportToggleList.styles';

interface IReportToggleListHeaderProps {
    checkAll: boolean;
    setSort: Dispatch<
        SetStateAction<{ type: ReportingSortType; desc?: boolean }>
    >;
    bulkActionsOn: boolean;
    handleCheckAll: () => void;
}

export const ReportToggleListHeader: VFC<IReportToggleListHeaderProps> = ({
    handleCheckAll,
    checkAll,
    setSort,
    bulkActionsOn,
}) => {
    const styles = useStyles();
    const handleSort = (type: ReportingSortType) => {
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
                    onClick={() => handleSort('name')}
                >
                    Name
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    className={styles.hideColumnLastSeen}
                    tabIndex={0}
                    onClick={() => handleSort('last-seen')}
                >
                    Last seen
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    className={styles.hideColumn}
                    onClick={() => handleSort('created')}
                >
                    Created
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    className={styles.hideColumn}
                    onClick={() => handleSort('expired')}
                >
                    Expired
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    className={styles.hideColumnStatus}
                    onClick={() => handleSort('status')}
                >
                    Status
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
                <th
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort('expired')}
                >
                    Report
                    <UnfoldMoreOutlinedIcon className={styles.sortIcon} />
                </th>
            </tr>
        </thead>
    );
};
