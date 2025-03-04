import type React from 'react';
import type { DragEventHandler, FC, ReactNode } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { Box, IconButton, styled } from '@mui/material';
import type { IFeatureStrategy } from 'interfaces/strategy';
import {
    formatStrategyName,
    getFeatureStrategyIcon,
} from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { PlaygroundStrategySchema } from 'openapi';
import { Badge } from '../Badge/Badge';
import { Link } from 'react-router-dom';

interface IStrategyItemContainerProps {
    strategy: IFeatureStrategy | PlaygroundStrategySchema;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    actions?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    description?: string;
    children?: React.ReactNode;
}

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
const StyledHeaderContainer = styled('div')({
    flexDirection: 'column',
    justifyContent: 'center',
    verticalAlign: 'middle',
});

const NewStyledContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'disabled',
})({
    background: 'inherit',
});

const NewStyledHeader = styled('div', {
    shouldForwardProp: (prop) => prop !== 'draggable' && prop !== 'disabled',
})<{ draggable: boolean; disabled: boolean }>(
    ({ theme, draggable, disabled }) => ({
        padding: theme.spacing(0.5, 2),
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        fontWeight: theme.typography.fontWeightMedium,
        paddingLeft: draggable ? theme.spacing(1) : theme.spacing(2),
        color: disabled
            ? theme.palette.text.secondary
            : theme.palette.text.primary,
    }),
);

export const StrategyItemContainer: FC<IStrategyItemContainerProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    actions,
    children,
    style = {},
    description,
}) => {
    const Icon = getFeatureStrategyIcon(strategy.name);

    const StrategyHeaderLink: React.FC<{ children?: React.ReactNode }> =
        'links' in strategy
            ? ({ children }) => <Link to={strategy.links.edit}>{children}</Link>
            : ({ children }) => <> {children} </>;

    return (
        <Box sx={{ position: 'relative' }}>
            <NewStyledContainer style={style}>
                <NewStyledHeader
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
                    <Icon
                        sx={{
                            fill: (theme) => theme.palette.action.disabled,
                        }}
                    />
                    <StyledHeaderContainer>
                        <StrategyHeaderLink>
                            <StringTruncator
                                maxWidth='400'
                                maxLength={15}
                                text={formatStrategyName(String(strategy.name))}
                            />
                            <ConditionallyRender
                                condition={Boolean(strategy.title)}
                                show={
                                    <StyledCustomTitle>
                                        {formatStrategyName(
                                            String(strategy.title),
                                        )}
                                    </StyledCustomTitle>
                                }
                            />
                        </StrategyHeaderLink>
                        <ConditionallyRender
                            condition={Boolean(description)}
                            show={
                                <StyledDescription>
                                    {description}
                                </StyledDescription>
                            }
                        />
                    </StyledHeaderContainer>

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
                        {actions}
                    </Box>
                </NewStyledHeader>
                <Box sx={{ p: 2, pt: 0 }}>{children}</Box>
            </NewStyledContainer>
        </Box>
    );
};
