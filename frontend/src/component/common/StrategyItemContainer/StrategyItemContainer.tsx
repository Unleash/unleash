import type React from 'react';
import type { DragEventHandler, FC, ReactNode } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { Box, IconButton, Typography, styled } from '@mui/material';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { formatStrategyName } from 'utils/strategyNames';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { PlaygroundStrategySchema } from 'openapi';
import { Badge } from '../Badge/Badge';
import { Link } from 'react-router-dom';

type StrategyItemContainerProps = {
    strategyHeaderLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    strategy: Omit<IFeatureStrategy, 'id'> | PlaygroundStrategySchema;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    headerItemsRight?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    description?: string;
    children?: React.ReactNode;
};

const DragIcon = styled(IconButton)({
    padding: 0,
    cursor: 'inherit',
    transition: 'color 0.2s ease-in-out',
});

const StyledDescription = styled('div')(({ theme }) => ({
    fontSize: theme.typography.fontSize,
    fontWeight: 'normal',
    color: theme.palette.text.secondary,
    display: 'none',
    top: theme.spacing(2.5),
    [theme.breakpoints.up('md')]: {
        display: 'block',
    },
}));
const StyledCustomTitle = styled('div')(({ theme }) => ({
    fontWeight: 'normal',
    display: 'none',
    [theme.breakpoints.up('md')]: {
        display: 'block',
    },
}));
const StyledHeaderContainer = styled('hgroup')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row',
    columnGap: '1ch',
    fontSize: theme.typography.body1.fontSize,
    '.strategy-name': {
        fontWeight: 'bold',
    },
}));

const StyledContainer = styled('article')({
    background: 'inherit',
});

const StyledHeader = styled('div', {
    shouldForwardProp: (prop) => prop !== 'draggable' && prop !== 'disabled',
})<{ draggable: boolean; disabled: boolean }>(
    ({ theme, draggable, disabled }) => ({
        padding: theme.spacing(0.5, 2),
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        paddingLeft: draggable ? theme.spacing(1) : theme.spacing(2),
        color: disabled
            ? theme.palette.text.secondary
            : theme.palette.text.primary,
    }),
);

export const StrategyItemContainer: FC<StrategyItemContainerProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    headerItemsRight,
    strategyHeaderLevel = 3,
    children,
    style = {},
    description,
}) => {
    const StrategyHeaderLink: React.FC<{ children?: React.ReactNode }> =
        'links' in strategy // todo: revisit this when we get to playground, related to flag `flagOverviewRedesign`
            ? ({ children }) => <Link to={strategy.links.edit}>{children}</Link>
            : ({ children }) => <> {children} </>;

    return (
        <Box sx={{ position: 'relative' }}>
            <StyledContainer style={style}>
                <StyledHeader
                    draggable={Boolean(onDragStart)}
                    disabled={Boolean(strategy?.disabled)}
                >
                    <ConditionallyRender
                        condition={Boolean(onDragStart)}
                        show={() => (
                            <DragIcon
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
                        )}
                    />
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
                                    <Typography
                                        component={`h${strategyHeaderLevel}`}
                                    >
                                        {strategy.title}
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    className='strategy-name'
                                    component={`h${strategyHeaderLevel}`}
                                >
                                    {formatStrategyName(String(strategy.name))}
                                </Typography>
                            )}
                            <ConditionallyRender
                                condition={Boolean(description)}
                                show={
                                    <StyledDescription>
                                        {description}
                                    </StyledDescription>
                                }
                            />
                        </StyledHeaderContainer>
                    </StrategyHeaderLink>

                    <ConditionallyRender
                        condition={Boolean(strategy?.disabled)}
                        show={() => (
                            <>
                                <Badge color='disabled'>Disabled</Badge>
                            </>
                        )}
                    />
                    <Box
                        sx={{
                            marginLeft: 'auto',
                            display: 'flex',
                            minHeight: (theme) => theme.spacing(6),
                            alignItems: 'center',
                        }}
                    >
                        {headerItemsRight}
                    </Box>
                </StyledHeader>
                <Box sx={{ p: 2, pt: 0 }}>{children}</Box>
            </StyledContainer>
        </Box>
    );
};
