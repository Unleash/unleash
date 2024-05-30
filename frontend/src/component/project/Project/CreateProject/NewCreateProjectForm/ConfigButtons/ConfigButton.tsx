import { v4 as uuidv4 } from 'uuid';
import { type FC, type ReactNode, useRef, type PropsWithChildren } from 'react';
import { Box, Button } from '@mui/material';
import {
    StyledDropdown,
    StyledPopover,
    HiddenDescription,
    ButtonLabel,
} from './ConfigButton.styles';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';

export type ConfigButtonProps = {
    button: { label: string; icon: ReactNode; labelWidth?: string };
    onOpen?: () => void;
    onClose?: () => void;
    description: string;
    preventOpen?: boolean;
    anchorEl: HTMLDivElement | null | undefined;
    setAnchorEl: (el: HTMLDivElement | null | undefined) => void;
    tooltipHeader: string;
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
    tooltipHeader,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const descriptionId = uuidv4();

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
                        <article>
                            <h3>{tooltipHeader}</h3>
                            <p>{description}</p>
                        </article>
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
            >
                <HiddenDescription id={descriptionId}>
                    {description}
                </HiddenDescription>
                <StyledDropdown aria-describedby={descriptionId}>
                    {children}
                </StyledDropdown>
            </StyledPopover>
        </>
    );
};
