import type { ReactNode, FC } from 'react';
import { Button, type ButtonProps, Icon } from '@mui/material';

interface IDropdownButtonProps {
    label: string | ReactNode;
    id?: string;
    title?: ButtonProps['title'];
    className?: string;
    icon?: ReactNode;
    startIcon?: ButtonProps['startIcon'];
    style?: ButtonProps['style'];
    onClick: ButtonProps['onClick'];
}

export const DropdownButton: FC<IDropdownButtonProps> = ({
    label,
    icon,
    ...rest
}) => (
    <Button {...rest} endIcon={<Icon>{icon}</Icon>}>
        {label}
    </Button>
);
