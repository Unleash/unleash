import React, { ReactNode } from 'react';
import { TableCell } from '@material-ui/core';
import classnames from 'classnames';
import {
    UnfoldMoreOutlined,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from '@material-ui/icons';
import { IUsersSort, UsersSortType } from 'hooks/useUsersSort';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { useStyles } from 'component/common/Table/TableCellSortable/TableCellSortable.styles';

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
    const styles = useStyles();

    return (
        <TableCell
            className={classnames(
                className,
                styles.tableCellHeaderSortable,
                sort.type === name && 'sorted'
            )}
            onClick={() =>
                setSort(prev => ({
                    desc: !Boolean(prev.desc),
                    type: name,
                }))
            }
        >
            {children}
            <ConditionallyRender
                condition={sort.type === name}
                show={
                    <ConditionallyRender
                        condition={Boolean(sort.desc)}
                        show={<KeyboardArrowDown />}
                        elseShow={<KeyboardArrowUp />}
                    />
                }
                elseShow={<UnfoldMoreOutlined />}
            />
        </TableCell>
    );
};
