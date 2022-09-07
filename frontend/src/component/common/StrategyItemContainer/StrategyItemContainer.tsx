import { DragEventHandler, FC, ReactNode } from 'react';
import { DragIndicator } from '@mui/icons-material';
import { styled, IconButton, Box } from '@mui/material';
import classNames from 'classnames';
import { IFeatureStrategy } from 'interfaces/strategy';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './StrategyItemContainer.styles';

interface IStrategyItemContainerProps {
    strategy: IFeatureStrategy;
    onDragStart?: DragEventHandler<HTMLButtonElement>;
    onDragEnd?: DragEventHandler<HTMLButtonElement>;
    actions?: ReactNode;
    orderNumber?: number;
    className?: string;
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

export const StrategyItemContainer: FC<IStrategyItemContainerProps> = ({
    strategy,
    onDragStart,
    onDragEnd,
    actions,
    children,
    orderNumber,
    className,
}) => {
    const { classes: styles } = useStyles();
    const Icon = getFeatureStrategyIcon(strategy.name);

    return (
        <Box sx={{ position: 'relative' }}>
            <ConditionallyRender
                condition={orderNumber !== undefined}
                show={<StyledIndexLabel>{orderNumber}</StyledIndexLabel>}
            />
            <Box className={classNames(styles.container, className)}>
                <div
                    className={classNames(styles.header, {
                        [styles.headerDraggable]: Boolean(onDragStart),
                    })}
                >
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
                    <Icon className={styles.icon} />
                    <StringTruncator
                        maxWidth="150"
                        maxLength={15}
                        text={formatStrategyName(strategy.name)}
                    />
                    <div className={styles.actions}>{actions}</div>
                </div>
                <div className={styles.body}>{children}</div>
            </Box>
        </Box>
    );
};
