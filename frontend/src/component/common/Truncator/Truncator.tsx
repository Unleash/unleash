import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type CSSProperties,
} from 'react';
import {
    Box,
    Button,
    type BoxProps,
    styled,
    Tooltip,
    type TooltipProps,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const StyledTruncatorContainer = styled(Box, {
    shouldForwardProp: (prop) =>
        prop !== 'lines' && prop !== 'wordBreak' && prop !== 'expanded',
})<{
    lines: number;
    wordBreak?: CSSProperties['wordBreak'];
    expanded?: boolean;
}>(({ lines, wordBreak = 'break-all', expanded }) => ({
    lineClamp: `${lines}`,
    WebkitLineClamp: lines,
    display: expanded ? 'block' : '-webkit-box',
    boxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    alignItems: 'flex-start',
    WebkitBoxOrient: 'vertical',
    wordBreak,
    whiteSpace: 'normal',
}));

const StyledExpandWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(0.5),
}));

const StyledToggleButton = styled(Button)({
    paddingInline: 0,
});

type OverridableTooltipProps = Omit<TooltipProps, 'children'>;

export type TruncatorProps = {
    lines?: number;
    title?: string;
    arrow?: boolean;
    tooltipProps?: OverridableTooltipProps;
    children: React.ReactNode;
    onSetTruncated?: (isTruncated: boolean) => void;
    wordBreak?: CSSProperties['wordBreak'];
    expandable?: boolean;
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
    expandable = false,
    ...props
}: TruncatorProps) => {
    const [isTruncated, setIsTruncated] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const checkTruncation = useCallback(() => {
        if (ref.current) {
            setIsTruncated(
                ref.current.scrollHeight > ref.current.offsetHeight ||
                    ref.current.scrollWidth > ref.current.offsetWidth,
            );
        }
    }, []);
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-check truncation when content changes
    useEffect(() => {
        if (!isExpanded) {
            checkTruncation();
        }
    }, [checkTruncation, isExpanded, title, children]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (!isExpanded) {
                checkTruncation();
            }
        });
        if (ref.current) {
            resizeObserver.observe(ref.current);
        }
        return () => resizeObserver.disconnect();
    }, [checkTruncation, isExpanded]);

    useEffect(() => {
        onSetTruncated?.(isTruncated);
    }, [isTruncated, onSetTruncated]);

    const overridableTooltipProps: OverridableTooltipProps = {
        title,
        arrow,
        ...tooltipProps,
    };

    const { title: tooltipTitle, ...otherTooltipProps } =
        overridableTooltipProps;

    const defaultWordBreak = lines === 1 ? 'break-all' : 'break-word';

    const truncated = (
        <StyledTruncatorContainer
            ref={ref}
            lines={lines}
            as={component}
            wordBreak={wordBreak || defaultWordBreak}
            expanded={expandable && isExpanded}
            {...props}
        >
            {children}
        </StyledTruncatorContainer>
    );

    if (!expandable) {
        return (
            <Tooltip
                title={isTruncated ? tooltipTitle : ''}
                {...otherTooltipProps}
            >
                {truncated}
            </Tooltip>
        );
    }

    const showToggle = isTruncated || isExpanded;

    return (
        <StyledExpandWrapper>
            {truncated}
            {showToggle ? (
                <StyledToggleButton
                    variant='text'
                    size='medium'
                    aria-expanded={isExpanded}
                    endIcon={
                        isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={() => setIsExpanded((prev) => !prev)}
                >
                    {isExpanded ? 'Show less' : 'Show more'}
                </StyledToggleButton>
            ) : null}
        </StyledExpandWrapper>
    );
};
