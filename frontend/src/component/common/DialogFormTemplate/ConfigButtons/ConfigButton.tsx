import { type FC, type ReactNode, useRef, type PropsWithChildren } from 'react';
import { Box, Button } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ButtonLabel, StyledTooltipContent } from './ConfigButton.styles';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { StyledPopover } from './shared.styles';
import { useId } from 'hooks/useId';

export type ConfigButtonVariant = 'default' | 'pill';

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
    variant?: ConfigButtonVariant;
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
    variant = 'default',
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const descriptionId = useId('config-button-description');

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
                        color={variant === 'pill' ? 'inherit' : 'primary'}
                        startIcon={variant === 'pill' ? undefined : button.icon}
                        endIcon={
                            variant === 'pill' ? (
                                <ArrowDropDownIcon />
                            ) : undefined
                        }
                        onClick={() => {
                            if (!preventOpen) {
                                open();
                            }
                        }}
                        sx={
                            variant === 'pill'
                                ? (theme) => ({
                                      borderColor: theme.palette.divider,
                                      backgroundColor:
                                          theme.palette.background.paper,
                                      color: theme.palette.text.primary,
                                      textTransform: 'none',
                                      fontWeight:
                                          theme.typography.body1.fontWeight,
                                      borderRadius: '4px',
                                      padding: theme.spacing(1, 2),
                                      minWidth: theme.spacing(18),
                                      justifyContent: 'space-between',
                                      '&:hover': {
                                          borderColor:
                                              theme.palette.text.secondary,
                                          backgroundColor:
                                              theme.palette.background.paper,
                                      },
                                      '& .MuiButton-endIcon': {
                                          marginLeft: 'auto',
                                      },
                                  })
                                : undefined
                        }
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
