import type React from 'react';
import {
    type FC,
    type MouseEventHandler,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Tooltip } from '@mui/material';
import { AnnouncerContext } from 'component/common/Announcer/AnnouncerContext/AnnouncerContext';
import {
    StyledButton,
    StyledHiddenMeasurementLayer,
    StyledLabel,
    StyledTableCell,
    StyledVisibleAbsoluteLayer,
} from './CellSortable.styles';
import { SortArrow } from './SortArrow/SortArrow.tsx';

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
    styles?: React.CSSProperties;
    children?: React.ReactNode;
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
    styles,
}) => {
    const { setAnnouncement } = useContext(AnnouncerContext);
    const [tooltipTitle, setTooltipTitle] = useState('');
    const ref = useRef<HTMLSpanElement>(null);

    const ariaSort = isSorted
        ? isDescending
            ? 'descending'
            : 'ascending'
        : undefined;

    const onSortClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        onClick(event);
        setAnnouncement(
            `Sorted${ariaTitle ? ` by ${ariaTitle} ` : ''}, ${
                isDescending ? 'ascending' : 'descending'
            }`,
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
        const newTooltipTitle =
            ariaTitle &&
            ref.current &&
            ref?.current?.offsetWidth < ref?.current?.scrollWidth
                ? `${children}`
                : '';

        if (newTooltipTitle !== tooltipTitle) {
            setTooltipTitle(newTooltipTitle);
        }
    }, [setTooltipTitle, ariaTitle]);

    return (
        <StyledTableCell
            component='th'
            aria-sort={ariaSort}
            style={{ width, minWidth, maxWidth, ...styles }}
            isFlex={isFlex}
            isFlexGrow={isFlexGrow}
            isSortable={isSortable}
        >
            {isSortable ? (
                <Tooltip title={tooltipTitle} arrow>
                    <StyledButton
                        isSorted={isSorted}
                        type='button'
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
                                className='sort-arrow'
                            />
                        </StyledVisibleAbsoluteLayer>
                    </StyledButton>
                </Tooltip>
            ) : (
                <div style={alignStyle}>{children}</div>
            )}
        </StyledTableCell>
    );
};
