import { useState, useEffect, useRef, type CSSProperties } from 'react';
import {
    Box,
    type BoxProps,
    styled,
    Tooltip,
    type TooltipProps,
} from '@mui/material';

const StyledTruncatorContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'lines' && prop !== 'wordBreak',
})<{ lines: number; wordBreak?: CSSProperties['wordBreak'] }>(
    ({ lines, wordBreak = 'break-all' }) => ({
        lineClamp: `${lines}`,
        WebkitLineClamp: lines,
        display: '-webkit-box',
        boxOrient: 'vertical',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        alignItems: 'flex-start',
        WebkitBoxOrient: 'vertical',
        wordBreak,
    }),
);

type OverridableTooltipProps = Omit<TooltipProps, 'children'>;

export type TruncatorProps = {
    lines?: number;
    title?: string;
    arrow?: boolean;
    tooltipProps?: OverridableTooltipProps;
    children: React.ReactNode;
    onSetTruncated?: (isTruncated: boolean) => void;
    wordBreak?: CSSProperties['wordBreak'];
} & BoxProps;

export const Truncator = ({
    lines = 1,
    title,
    arrow,
    tooltipProps,
    children,
    component = 'span',
    onSetTruncated,
    wordBreak,
    ...props
}: TruncatorProps) => {
    const [isTruncated, setIsTruncated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const checkTruncation = () => {
        if (ref.current) {
            setIsTruncated(
                ref.current.scrollHeight > ref.current.offsetHeight ||
                    ref.current.scrollWidth > ref.current.offsetWidth,
            );
        }
    };
    useEffect(() => {
        const resizeObserver = new ResizeObserver(checkTruncation);
        if (ref.current) {
            resizeObserver.observe(ref.current);
        }
        return () => resizeObserver.disconnect();
    }, [title, children]);

    useEffect(() => {
        onSetTruncated?.(isTruncated);
    }, [isTruncated]);

    const overridableTooltipProps: OverridableTooltipProps = {
        title,
        arrow,
        ...tooltipProps,
    };

    const { title: tooltipTitle, ...otherTooltipProps } =
        overridableTooltipProps;

    const defaultWordBreak = lines === 1 ? 'break-all' : 'break-word';

    return (
        <Tooltip title={isTruncated ? tooltipTitle : ''} {...otherTooltipProps}>
            <StyledTruncatorContainer
                ref={ref}
                lines={lines}
                component={component}
                wordBreak={wordBreak || defaultWordBreak}
                {...props}
            >
                {children}
            </StyledTruncatorContainer>
        </Tooltip>
    );
};
