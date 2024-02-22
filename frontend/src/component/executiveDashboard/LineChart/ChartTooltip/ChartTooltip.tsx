import { Box, Paper, styled, Typography } from '@mui/material';
import { TooltipItem } from 'chart.js';
import { FC, VFC } from 'react';
import { objectId } from 'utils/objectId';

export type TooltipState = {
    caretX: number;
    caretY: number;
    title: string;
    align: 'left' | 'right';
    body: {
        title: string;
        color: string;
        value: string;
    }[];
    dataPoints: TooltipItem<any>[]
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

export const ChartTooltipContainer: FC<IChartTooltipProps> = ({ tooltip, children }) => (
    <Box
        sx={(theme) => ({
            top: tooltip?.caretY,
            left:
                tooltip?.align === 'left'
                    ? tooltip?.caretX + 20
                    : 0,
            right:
                tooltip?.align === 'right'
                    ? tooltip?.caretX + 20
                    : undefined,
            position: 'absolute',
            display: tooltip ? 'flex' : 'none',
            pointerEvents: 'none',
            zIndex: theme.zIndex.tooltip,
            flexDirection: 'column',
            alignItems: tooltip?.align === 'left' ? 'flex-start' : 'flex-end',
        })}
    >
        {children}
    </Box>
)

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
        </Paper></ChartTooltipContainer>
);
