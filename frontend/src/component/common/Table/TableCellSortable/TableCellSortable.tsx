import React, { ReactNode, useContext } from 'react';
import { TableCell } from '@material-ui/core';
import classnames from 'classnames';
import {
    UnfoldMoreOutlined,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from '@material-ui/icons';
import { IUsersSort, UsersSortType } from 'hooks/useUsersSort';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from 'component/common/Table/TableCellSortable/TableCellSortable.styles';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';

// Add others as needed, e.g. UsersSortType | FeaturesSortType
type SortType = UsersSortType;
type Sort = IUsersSort;

interface ITableCellSortableProps {
    className?: string;
    name: SortType;
    sort: Sort;
    setSort: React.Dispatch<React.SetStateAction<Sort>>;
    children: ReactNode;
}

export const TableCellSortable = ({
    className,
    name,
    sort,
    setSort,
    children,
}: ITableCellSortableProps) => {
    const { setAnnouncement } = useContext(AnnouncerContext);
    const styles = useStyles();

    const ariaSort =
        sort.type === name
            ? sort.desc
                ? 'descending'
                : 'ascending'
            : undefined;

    const cellClassName = classnames(
        className,
        styles.tableCellHeaderSortable,
        sort.type === name && 'sorted'
    );

    const onSortClick = () => {
        setSort(prev => ({
            desc: !Boolean(prev.desc),
            type: name,
        }));
        setAnnouncement(
            `Sorted table by ${name}, ${sort.desc ? 'ascending' : 'descending'}`
        );
    };

    return (
        <TableCell aria-sort={ariaSort} className={cellClassName}>
            <button className={styles.sortButton} onClick={onSortClick}>
                {children}
                <ConditionallyRender
                    condition={sort.type === name}
                    show={
                        <ConditionallyRender
                            condition={Boolean(sort.desc)}
                            show={
                                <KeyboardArrowDown
                                    className={styles.icon}
                                    fontSize="inherit"
                                />
                            }
                            elseShow={
                                <KeyboardArrowUp
                                    className={styles.icon}
                                    fontSize="inherit"
                                />
                            }
                        />
                    }
                    elseShow={
                        <UnfoldMoreOutlined
                            className={styles.icon}
                            fontSize="inherit"
                        />
                    }
                />
            </button>
        </TableCell>
    );
};
