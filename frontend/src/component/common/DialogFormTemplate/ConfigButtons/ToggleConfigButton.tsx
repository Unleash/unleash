import type { ConfigButtonProps } from './ConfigButton';
import { ButtonLabel, StyledTooltipContent } from './ConfigButton.styles';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Button } from '@mui/material';

type ToggleConfigButtonProps = Pick<
    ConfigButtonProps,
    'button' | 'onOpen' | 'onClose' | 'description' | 'tooltip'
> & { onChange: (value: boolean) => void; currentValue: boolean };

export function ToggleConfigButton({
    onChange,
    currentValue,
    button,
    tooltip,
    description,
}: ToggleConfigButtonProps) {
    return (
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
                aria-role='switch'
                aria-checked={currentValue}
                variant={currentValue ? 'contained' : 'outlined'}
                color='primary'
                startIcon={button.icon}
                onClick={() => onChange(!currentValue)}
                disableElevation={true}
            >
                <ButtonLabel labelWidth={button.labelWidth}>
                    {button.label}
                </ButtonLabel>
            </Button>
        </TooltipResolver>
    );
}
