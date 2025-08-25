import { Box, Paper, styled, Typography } from '@mui/material';
import type { TooltipItem } from 'chart.js';
import { Truncator } from 'component/common/Truncator/Truncator';
import type React from 'react';
import { useEffect, useState, type FC, type VFC } from 'react';
import { objectId } from 'utils/objectId';

export type TooltipState = {
    caretX: number;
    caretY: number;
    title: string;
    align: 'left' | 'right' | 'center';
    body: {
        title: string;
        color: string;
        value: string;
    }[];
    dataPoints: TooltipItem<any>[];
};

interface IChartTooltipProps {
    tooltip: TooltipState | null;
    children?: React.ReactNode;
}

const StyledList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: 0,
}));

const StyledItem = styled('li')(({ theme }) => ({
    marginBottom: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.body2.fontSize,
}));

const StyledLabelIcon = styled('span')(({ theme }) => ({
    display: 'inline-block',
    minWidth: 8,
    minHeight: 8,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
}));

const offset = 16;

const getAlign = (align?: 'left' | 'right' | 'center') => {
    if (align === 'left') {
        return 'flex-start';
    }

    if (align === 'right') {
        return 'flex-end';
    }

    return 'center';
};

const getLeftOffset = (caretX = 0, align?: 'left' | 'right' | 'center') => {
    if (align === 'left') {
        return caretX + offset;
    }

    if (align === 'right') {
        return caretX - offset;
    }

    return caretX;
};

export const ChartTooltipContainer: FC<IChartTooltipProps> = ({
    tooltip,
    children,
}) => {
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);
    useEffect(() => {
        if (tooltip) {
            setTop(tooltip.caretY + offset);
            setLeft(getLeftOffset(tooltip.caretX, tooltip.align));
        }
    }, [tooltip]);
    return (
        <Box
            sx={(theme) => ({
                top: 0,
                left: 0,
                transform: `translate(${left}px, ${top}px)`,
                transition: 'transform 0.3s ease-in-out',
                width: '1px',
                position: 'absolute',
                display: tooltip ? 'flex' : 'none',
                pointerEvents: 'none',
                zIndex: theme.zIndex.tooltip,
                flexDirection: 'column',
                alignItems: getAlign(tooltip?.align),
            })}
        >
            {children}
        </Box>
    );
};

export const ChartTooltip: VFC<IChartTooltipProps> = ({ tooltip }) => (
    <ChartTooltipContainer tooltip={tooltip}>
        <Paper
            elevation={3}
            sx={(theme) => ({
                width: 220,
                padding: theme.spacing(1.5, 2),
            })}
        >
            {
                <Typography
                    variant='body2'
                    sx={(theme) => ({
                        marginBottom: theme.spacing(1),
                        color: theme.palette.text.secondary,
                    })}
                >
                    {tooltip?.title}
                </Typography>
            }
            <StyledList>
                {tooltip?.body.map((item) => (
                    <StyledItem key={objectId(item)}>
                        <StyledLabelIcon
                            sx={{
                                backgroundColor: item.color,
                            }}
                        >
                            {' '}
                        </StyledLabelIcon>
                        <Truncator lines={2}>{item.title}</Truncator>
                    </StyledItem>
                ))}
            </StyledList>
        </Paper>
    </ChartTooltipContainer>
);
