import type React from 'react';
import type { DragEventHandler, FC, ReactNode } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { Box, Chip, IconButton, Typography, styled } from '@mui/material';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { formatStrategyName } from 'utils/strategyNames';
import type { PlaygroundStrategySchema } from 'openapi';
import { Badge } from '../Badge/Badge';
import { Link } from 'react-router-dom';
import { Truncator } from '../Truncator/Truncator';
import { StrategyEvaluationChip } from '../ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';
import { RolloutVariants } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyExecution/RolloutParameter/RolloutVariants/RolloutVariants';

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
    isCollapsed?: boolean;
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

const StyledContainer = styled('article', {
    shouldForwardProp: prop => prop !== 'collapsed',
})<{ collapsed: boolean }>(({ theme, collapsed }) => ({
    background: 'inherit',
    padding: theme.spacing(inlinePadding),
    paddingTop: theme.spacing(0.5),
    paddingBottom: collapsed ? theme.spacing(0.5) : undefined,
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
    isCollapsed = false,
}) => {
    const StrategyHeaderLink: React.FC<{ children?: React.ReactNode }> =
        'links' in strategy
            ? ({ children }) => <Link to={strategy.links.edit}>{children}</Link>
            : ({ children }) => <> {children} </>;
    
    return (
        <Box sx={{ position: 'relative' }}>
            <StyledContainer style={style} className={className} collapsed={isCollapsed}>
                <StyledHeader disabled={Boolean(strategy?.disabled)}>
                    {onDragStart ? (
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

                        {strategy.disabled ? (
                            <Badge color='disabled'>Disabled</Badge>
                        ) : null}
                        {isCollapsed && strategy.parameters.rollout ? (
                            <StrategyEvaluationChip label={`${strategy.parameters.rollout}% Rollout`} />
                        ) : null}
                        {headerItemsLeft}
                    </StyledHeaderInner>
                    <Box
                        sx={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {headerItemsRight}
                    </Box>
                </StyledHeader>
                {isCollapsed && 'variants' in strategy ? (
                    <RolloutVariants variants={strategy.variants} reduceMargin />
                ) : null}
                <Box>{children}</Box>
            </StyledContainer>
        </Box>
    );
};
