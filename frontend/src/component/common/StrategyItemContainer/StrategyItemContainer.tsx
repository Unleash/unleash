import type React from 'react';
import type { DragEventHandler, FC, ReactNode } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { Box, IconButton, Typography, styled } from '@mui/material';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { formatStrategyName } from 'utils/strategyNames';
import type { PlaygroundStrategySchema } from 'openapi';
import { Badge } from '../Badge/Badge.tsx';
import { Link } from 'react-router-dom';
import { Truncator } from '../Truncator/Truncator.tsx';
import { disabledStrategyClassName } from './disabled-strategy-utils.ts';

type StrategyItemContainerProps = {
    strategyHeaderLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    strategy: Omit<IFeatureStrategy, 'id'> | PlaygroundStrategySchema;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    headerItemsRight?: ReactNode;
    headerItemsLeft?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
};

const inlinePadding = 3;

const DragIcon = styled(IconButton)(({ theme }) => ({
    marginLeft: theme.spacing(-inlinePadding),
    padding: 0,
    cursor: 'inherit',
    transition: 'color 0.2s ease-in-out',
}));

const StyledHeaderContainer = styled('hgroup')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row nowrap',
    columnGap: '1ch',
    fontSize: theme.typography.body1.fontSize,
    '.strategy-name': {
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
    },
}));

const StyledContainer = styled('article')(({ theme }) => ({
    background: 'inherit',
    padding: theme.spacing(inlinePadding),
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(0.5),
}));

const StyledTruncator = styled(Truncator)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'normal',
    margin: 0,
}));

const StyledHeader = styled('div', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled: boolean }>(({ theme, disabled }) => ({
    display: 'flex',
    alignItems: 'center',
    color: disabled ? theme.palette.text.secondary : theme.palette.text.primary,
}));

const StyledHeaderInner = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

export const StrategyItemContainer: FC<StrategyItemContainerProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    headerItemsRight,
    headerItemsLeft,
    strategyHeaderLevel = 3,
    children,
    style = {},
    className,
}) => {
    const StrategyHeaderLink: React.FC<{ children?: React.ReactNode }> =
        'links' in strategy
            ? ({ children }) => <Link to={strategy.links.edit}>{children}</Link>
            : ({ children }) => <> {children} </>;

    return (
        <Box
            className={strategy.disabled ? disabledStrategyClassName : ''}
            sx={{ position: 'relative' }}
        >
            <StyledContainer style={style} className={className}>
                <StyledHeader disabled={Boolean(strategy?.disabled)}>
                    {onDragStart ? (
                        <DragIcon
                            tabIndex={-1}
                            className='strategy-drag-handle'
                            draggable
                            disableRipple
                            size='small'
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            sx={{ cursor: 'move' }}
                        >
                            <DragIndicator
                                titleAccess='Drag to reorder'
                                cursor='grab'
                                sx={{ color: 'action.active' }}
                            />
                        </DragIcon>
                    ) : null}
                    <StyledHeaderInner>
                        <StrategyHeaderLink>
                            <StyledHeaderContainer>
                                {strategy.title ? (
                                    <>
                                        <p className='strategy-name'>
                                            {formatStrategyName(
                                                String(strategy.name),
                                            )}
                                            :
                                        </p>
                                        <StyledTruncator
                                            component={`h${strategyHeaderLevel}`}
                                        >
                                            {strategy.title}
                                        </StyledTruncator>
                                    </>
                                ) : (
                                    <Typography
                                        className='strategy-name'
                                        component={`h${strategyHeaderLevel}`}
                                    >
                                        {formatStrategyName(
                                            String(strategy.name),
                                        )}
                                    </Typography>
                                )}
                            </StyledHeaderContainer>
                        </StrategyHeaderLink>

                        {headerItemsLeft}
                    </StyledHeaderInner>
                    <Box
                        sx={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {strategy.disabled ? (
                            <Badge color='warning'>Strategy disabled</Badge>
                        ) : null}
                        {headerItemsRight}
                    </Box>
                </StyledHeader>
                <Box>{children}</Box>
            </StyledContainer>
        </Box>
    );
};
