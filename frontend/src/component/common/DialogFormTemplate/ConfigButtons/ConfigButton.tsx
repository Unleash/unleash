import { type FC, type ReactNode, useRef, type PropsWithChildren } from 'react';
import { Box, Button } from '@mui/material';
import { ButtonLabel, StyledTooltipContent } from './ConfigButton.styles';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { StyledPopover } from './shared.styles';

export type ConfigButtonProps = {
    button: {
        label: string;
        icon: ReactNode;
        labelWidth?: string;
        additionalTooltipContent?: ReactNode;
    };
    onOpen?: () => void;
    onClose?: () => void;
    description: string;
    preventOpen?: boolean;
    anchorEl: HTMLDivElement | null | undefined;
    setAnchorEl: (el: HTMLDivElement | null | undefined) => void;
    tooltip: {
        header: string;
        additionalContent?: ReactNode;
    };
};

export const ConfigButton: FC<PropsWithChildren<ConfigButtonProps>> = ({
    button,
    onOpen = () => {},
    onClose = () => {},
    description,
    children,
    preventOpen,
    anchorEl,
    setAnchorEl,
    tooltip,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const descriptionId = crypto.randomUUID();

    const open = () => {
        setAnchorEl(ref.current);
        onOpen();
    };

    const handleClose = () => {
        setAnchorEl(null);
        onClose();
    };

    return (
        <>
            <Box ref={ref}>
                <TooltipResolver
                    titleComponent={
                        <StyledTooltipContent>
                            <h3>{tooltip.header}</h3>
                            <p>{description}</p>
                            {tooltip.additionalContent}
                        </StyledTooltipContent>
                    }
                    variant='custom'
                >
                    <Button
                        variant='outlined'
                        color='primary'
                        startIcon={button.icon}
                        onClick={() => {
                            if (!preventOpen) {
                                open();
                            }
                        }}
                    >
                        <ButtonLabel labelWidth={button.labelWidth}>
                            {button.label}
                        </ButtonLabel>
                    </Button>
                </TooltipResolver>
            </Box>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                aria-describedby={descriptionId}
            >
                <ScreenReaderOnly>
                    <p id={descriptionId}>{description}</p>
                </ScreenReaderOnly>
                {children}
            </StyledPopover>
        </>
    );
};
