import { ButtonLabel, StyledTooltipContent } from './ConfigButton.styles';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Button } from '@mui/material';
import type { ReactNode } from 'react';

type ToggleConfigButtonProps = {
    onClick: () => void;
    currentValue: boolean;
    label: string;
    icon: ReactNode;
    labelWidth?: string;
    tooltip: {
        header: string;
        description: string;
        additionalContent?: ReactNode;
    };
};

export function ToggleConfigButton({
    onClick,
    currentValue,
    label,
    icon,
    labelWidth,
    tooltip,
}: ToggleConfigButtonProps) {
    return (
        <TooltipResolver
            titleComponent={
                <StyledTooltipContent>
                    <h3>{tooltip.header}</h3>
                    <p>{tooltip.description}</p>
                    {tooltip.additionalContent}
                </StyledTooltipContent>
            }
            variant='custom'
        >
            <Button
                role='switch'
                aria-checked={currentValue}
                variant={currentValue ? 'contained' : 'outlined'}
                color='primary'
                startIcon={icon}
                onClick={onClick}
                disableElevation={true}
            >
                <ButtonLabel labelWidth={labelWidth}>{label}</ButtonLabel>
            </Button>
        </TooltipResolver>
    );
}
