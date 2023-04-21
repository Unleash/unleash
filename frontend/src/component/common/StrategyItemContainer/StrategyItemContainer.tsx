import { DragEventHandler, FC, ReactNode } from 'react';
import { DragIndicator } from '@mui/icons-material';
import { styled, IconButton, Box } from '@mui/material';
import { IFeatureStrategy } from 'interfaces/strategy';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PlaygroundStrategySchema } from 'openapi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IStrategyItemContainerProps {
    strategy: IFeatureStrategy | PlaygroundStrategySchema;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    actions?: ReactNode;
    orderNumber?: number;
    className?: string;
    style?: React.CSSProperties;
}

const DragIcon = styled(IconButton)(({ theme }) => ({
    padding: 0,
    cursor: 'inherit',
    transition: 'color 0.2s ease-in-out',
}));

const StyledIndexLabel = styled('div')(({ theme }) => ({
    fontSize: theme.typography.fontSize,
    color: theme.palette.text.secondary,
    position: 'absolute',
    display: 'none',
    right: 'calc(100% + 6px)',
    top: theme.spacing(2.5),
    [theme.breakpoints.up('md')]: {
        display: 'block',
    },
}));

const StyledContainer = styled(Box, {
    shouldForwardProp: prop => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px ${disabled ? 'dashed' : 'solid'} ${theme.palette.divider}`,
    '& + &': {
        marginTop: theme.spacing(2),
    },
    background: disabled
        ? theme.palette.envAccordion.disabled
        : theme.palette.background.paper,
}));

const StyledHeader = styled('div', {
    shouldForwardProp: prop => prop !== 'draggable',
})(({ theme, draggable }) => ({
    padding: theme.spacing(0.5, 2),
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: theme.typography.fontWeightMedium,
    paddingLeft: draggable ? theme.spacing(1) : theme.spacing(2),
}));

export const StrategyItemContainer: FC<IStrategyItemContainerProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    actions,
    children,
    orderNumber,
    style = {},
}) => {
    const Icon = getFeatureStrategyIcon(strategy.name);
    const { uiConfig } = useUiConfig();

    return (
        <Box sx={{ position: 'relative' }}>
            <ConditionallyRender
                condition={orderNumber !== undefined}
                show={<StyledIndexLabel>{orderNumber}</StyledIndexLabel>}
            />
            <StyledContainer disabled={strategy?.disabled || false} style={style}>
                <StyledHeader draggable={Boolean(onDragStart)}>
                    <ConditionallyRender
                        condition={Boolean(onDragStart)}
                        show={() => (
                            <DragIcon
                                draggable
                                disableRipple
                                size="small"
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                sx={{ cursor: 'move' }}
                            >
                                <DragIndicator
                                    titleAccess="Drag to reorder"
                                    cursor="grab"
                                    sx={{ color: 'neutral.main' }}
                                />
                            </DragIcon>
                        )}
                    />
                    <Icon
                        sx={{
                            fill: theme => theme.palette.action.disabled,
                        }}
                    />
                    <StringTruncator
                        maxWidth="150"
                        maxLength={15}
                        text={formatStrategyName(
                            uiConfig?.flags?.strategyTitle
                                ? strategy.title || strategy.name
                                : strategy.name
                        )}
                    />
                    <Box
                        sx={{
                            marginLeft: 'auto',
                            display: 'flex',
                            minHeight: theme => theme.spacing(6),
                            alignItems: 'center',
                        }}
                    >
                        {actions}
                    </Box>
                </StyledHeader>
                <Box
                    sx={{
                        p: 2,
                        justifyItems: 'center',
                    }}
                >
                    {children}
                </Box>
            </StyledContainer>
        </Box>
    );
};
