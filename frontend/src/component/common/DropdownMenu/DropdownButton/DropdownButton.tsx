import { ReactNode, VFC } from 'react';
import { Button, ButtonProps, Icon } from '@mui/material';

interface IDropdownButtonProps {
    label: string;
    id?: string;
    title?: ButtonProps['title'];
    className?: string;
    icon?: ReactNode;
    startIcon?: ButtonProps['startIcon'];
    style?: ButtonProps['style'];
    onClick: ButtonProps['onClick'];
}

export const DropdownButton: VFC<IDropdownButtonProps> = ({
    label,
    icon,
    ...rest
}) => (
    <Button {...rest} endIcon={<Icon>{icon}</Icon>}>
        {label}
    </Button>
);
