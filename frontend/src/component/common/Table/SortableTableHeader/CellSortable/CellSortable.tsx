import React, { FC, MouseEventHandler, useContext } from 'react';
import { TableCell } from '@mui/material';
import classnames from 'classnames';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './CellSortable.styles';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';
import { SortArrow } from './SortArrow/SortArrow';

interface ICellSortableProps {
    isSortable?: boolean;
    isSorted?: boolean;
    isDescending?: boolean;
    ariaTitle?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const CellSortable: FC<ICellSortableProps> = ({
    children,
    isSortable = true,
    isSorted = false,
    isDescending,
    ariaTitle,
    onClick = () => {},
}) => {
    const { setAnnouncement } = useContext(AnnouncerContext);
    const { classes: styles } = useStyles();

    const ariaSort = isSorted
        ? isDescending
            ? 'descending'
            : 'ascending'
        : undefined;

    const onSortClick: MouseEventHandler<HTMLButtonElement> = event => {
        onClick(event);
        setAnnouncement(
            `Sorted${ariaTitle ? ` by ${ariaTitle} ` : ''}, ${
                isDescending ? 'ascending' : 'descending'
            }`
        );
    };

    return (
        <TableCell
            component="th"
            aria-sort={ariaSort}
            className={classnames(styles.tableCellHeaderSortable)}
        >
            <ConditionallyRender
                condition={isSortable}
                show={
                    <button
                        className={classnames(
                            styles.sortButton,
                            isSorted && styles.sorted
                        )}
                        onClick={onSortClick}
                    >
                        {children}
                        <SortArrow isSorted={isSorted} isDesc={isDescending} />
                    </button>
                }
                elseShow={children}
            />
        </TableCell>
    );
};
