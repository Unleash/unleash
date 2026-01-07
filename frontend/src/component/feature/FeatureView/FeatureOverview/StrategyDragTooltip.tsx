import Close from '@mui/icons-material/Close';
import { Box, Button, IconButton, styled } from '@mui/material';
import type { FC } from 'react';
import Joyride, { type TooltipRenderProps } from 'react-joyride';

const StyledTooltip = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxWidth: '300px',
    background: '#201e42',
    borderRadius: theme.shape.borderRadiusMedium,
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
}));

const OkButton = styled(Button)(({ theme }) => ({
    color: theme.palette.secondary.border,
    alignSelf: 'start',
    marginLeft: theme.spacing(-1),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.common.white,
    background: 'none',
    border: 'none',
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    svg: {
        width: theme.spacing(2),
        height: theme.spacing(2),
    },
}));

const StyledHeader = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
}));

const CustomTooltip = ({ closeProps }: TooltipRenderProps) => {
    return (
        <StyledTooltip component='article'>
            <StyledCloseButton type='button' {...closeProps}>
                <Close />
            </StyledCloseButton>
            <StyledHeader>Decide the order evaluation</StyledHeader>
            <p>
                Strategies are evaluated in the order presented here. Drag and
                rearrange the strategies to get the order you prefer.
            </p>
            <OkButton
                type='button'
                data-action={closeProps['data-action']}
                onClick={closeProps.onClick}
            >
                Ok, got it!
            </OkButton>
        </StyledTooltip>
    );
};

type Props = {
    show: boolean;
    onClose: () => void;
};

export const StrategyDragTooltip: FC<Props> = ({ show, onClose }) => {
    return (
        <Joyride
            callback={({ action }) => {
                if (action === 'close') {
                    onClose();
                }
            }}
            floaterProps={{
                styles: {
                    arrow: {
                        color: '#201e42',
                        spread: 16,
                        length: 10,
                    },
                },
            }}
            run={show}
            disableOverlay
            disableScrolling
            tooltipComponent={CustomTooltip}
            steps={[
                {
                    disableBeacon: true,
                    offset: 0,
                    target: '.strategy-drag-handle',
                    content: <></>,
                },
            ]}
        />
    );
};
