import { Paper, styled, Typography } from '@mui/material';
import { VFC } from 'react';

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

export const ChartTooltip: VFC<IChartTooltipProps> = ({ tooltip }) => (
    <Paper
        elevation={3}
        sx={(theme) => ({
            top: tooltip?.caretY,
            left:
                tooltip?.align === 'left'
                    ? tooltip?.caretX + 40
                    : (tooltip?.caretX || 0) - 220,
            position: 'absolute',
            display: tooltip ? 'block' : 'none',
            width: 220,
            padding: theme.spacing(1.5, 2),
            pointerEvents: 'none',
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
                <StyledItem key={item.title}>
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
);
