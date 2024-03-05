import { Box, Paper, styled, Typography } from '@mui/material';
import { TooltipItem } from 'chart.js';
import { FC, VFC } from 'react';
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
}));

const StyledLabelIcon = styled('span')(({ theme }) => ({
    display: 'inline-block',
    width: 8,
    height: 8,
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
}) => (
    <Box
        sx={(theme) => ({
            top: (tooltip?.caretY || 0) + offset,
            left: getLeftOffset(tooltip?.caretX, tooltip?.align),
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
                        <Typography
                            variant='body2'
                            sx={{
                                display: 'inline-block',
                            }}
                        >
                            {item.title}
                        </Typography>
                    </StyledItem>
                ))}
            </StyledList>
        </Paper>
    </ChartTooltipContainer>
);
