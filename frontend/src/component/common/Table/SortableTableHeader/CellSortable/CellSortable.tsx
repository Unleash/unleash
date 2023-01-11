import {
    FC,
    MouseEventHandler,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Tooltip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';
import {
    StyledButton,
    StyledHiddenMeasurementLayer,
    StyledLabel,
    StyledTableCell,
    StyledVisibleAbsoluteLayer,
} from './CellSortable.styles';
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
    isFlex?: boolean;
    isFlexGrow?: boolean;
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
    isFlex,
    isFlexGrow,
    onClick = () => {},
}) => {
    const { setAnnouncement } = useContext(AnnouncerContext);
    const [title, setTitle] = useState('');
    const ref = useRef<HTMLSpanElement>(null);

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

    const alignStyle = useMemo(() => {
        switch (align) {
            case 'left':
                return {
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                } as const;
            case 'center':
                return {
                    justifyContent: 'center',
                    textAlign: 'center',
                } as const;
            case 'right':
                return {
                    justifyContent: 'flex-end',
                    textAlign: 'right',
                } as const;
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
        <StyledTableCell
            component="th"
            aria-sort={ariaSort}
            style={{ width, minWidth, maxWidth }}
            isFlex={isFlex}
            isFlexGrow={isFlexGrow}
            isSortable={isSortable}
        >
            <ConditionallyRender
                condition={isSortable}
                show={
                    <Tooltip title={title} arrow>
                        <StyledButton
                            isSorted={isSorted}
                            type="button"
                            onClick={onSortClick}
                        >
                            <StyledHiddenMeasurementLayer
                                style={alignStyle}
                                aria-hidden
                            >
                                <StyledLabel tabIndex={-1} data-text={children}>
                                    {children}
                                </StyledLabel>
                                <SortArrow
                                    isSorted={isSorted}
                                    isDesc={isDescending}
                                />
                            </StyledHiddenMeasurementLayer>
                            <StyledVisibleAbsoluteLayer style={alignStyle}>
                                <span ref={ref} tabIndex={-1}>
                                    <span>{children}</span>
                                </span>
                                <SortArrow
                                    isSorted={isSorted}
                                    isDesc={isDescending}
                                    className="sort-arrow"
                                />
                            </StyledVisibleAbsoluteLayer>
                        </StyledButton>
                    </Tooltip>
                }
                elseShow={<div style={alignStyle}>{children}</div>}
            />
        </StyledTableCell>
    );
};
