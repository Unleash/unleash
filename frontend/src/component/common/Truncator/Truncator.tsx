import { useState, useEffect, useRef } from 'react';
import {
    Box,
    type BoxProps,
    styled,
    Tooltip,
    type TooltipProps,
} from '@mui/material';

const StyledTruncatorContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'lines',
})<{ lines: number }>(({ lines }) => ({
    lineClamp: `${lines}`,
    WebkitLineClamp: lines,
    display: '-webkit-box',
    boxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    alignItems: 'flex-start',
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-word',
}));

type OverridableTooltipProps = Omit<TooltipProps, 'children'>;

interface ITruncatorProps extends BoxProps {
    lines?: number;
    title?: string;
    arrow?: boolean;
    tooltipProps?: OverridableTooltipProps;
    children: React.ReactNode;
}

export const Truncator = ({
    lines = 1,
    title,
    arrow,
    tooltipProps,
    children,
    ...props
}: ITruncatorProps) => {
    const [isTruncated, setIsTruncated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const checkTruncation = () => {
        if (ref.current) {
            setIsTruncated(ref.current.scrollHeight > ref.current.offsetHeight);
        }
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver(checkTruncation);
        if (ref.current) {
            resizeObserver.observe(ref.current);
        }
        return () => resizeObserver.disconnect();
    }, [title, children]);

    const overridableTooltipProps: OverridableTooltipProps = {
        title,
        arrow,
        ...tooltipProps,
    };

    const { title: tooltipTitle, ...otherTooltipProps } =
        overridableTooltipProps;

    return (
        <Tooltip title={isTruncated ? tooltipTitle : ''} {...otherTooltipProps}>
            <StyledTruncatorContainer ref={ref} lines={lines} {...props}>
                {children}
            </StyledTruncatorContainer>
        </Tooltip>
    );
};
