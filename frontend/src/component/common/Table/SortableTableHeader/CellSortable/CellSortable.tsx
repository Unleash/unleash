import {
    FC,
    MouseEventHandler,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { TableCell, Tooltip } from '@mui/material';
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
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    align?: 'left' | 'center' | 'right';
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const CellSortable: FC<ICellSortableProps> = ({
    children,
    isSortable = true,
    isSorted = false,
    isDescending,
    width,
    minWidth,
    maxWidth,
    align,
    ariaTitle,
    onClick = () => {},
}) => {
    const { setAnnouncement } = useContext(AnnouncerContext);
    const [title, setTitle] = useState('');
    const ref = useRef<HTMLSpanElement>(null);
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

    const justifyContent = useMemo(() => {
        switch (align) {
            case 'left':
                return 'flex-start';
            case 'center':
                return 'center';
            case 'right':
                return 'flex-end';
            default:
                return undefined;
        }
    }, [align]);

    useEffect(() => {
        const updateTitle = () => {
            const newTitle =
                ariaTitle &&
                ref.current &&
                ref?.current?.offsetWidth < ref?.current?.scrollWidth
                    ? `${children}`
                    : '';

            if (newTitle !== title) {
                setTitle(newTitle);
            }
        };

        updateTitle();
    }, [setTitle, ariaTitle]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <TableCell
            component="th"
            aria-sort={ariaSort}
            className={classnames(styles.header, isSortable && styles.sortable)}
            style={{ width, minWidth, maxWidth }}
        >
            <ConditionallyRender
                condition={isSortable}
                show={
                    <Tooltip title={title} arrow>
                        <button
                            className={classnames(
                                isSorted && styles.sortedButton,
                                styles.sortButton
                            )}
                            onClick={onSortClick}
                            style={{ justifyContent }}
                        >
                            <span
                                className={styles.label}
                                ref={ref}
                                tabIndex={-1}
                            >
                                {children}
                            </span>
                            <SortArrow
                                isSorted={isSorted}
                                isDesc={isDescending}
                            />
                        </button>
                    </Tooltip>
                }
                elseShow={children}
            />
        </TableCell>
    );
};
