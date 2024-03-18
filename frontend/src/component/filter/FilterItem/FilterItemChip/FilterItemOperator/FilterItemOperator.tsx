import { styled, Menu, MenuItem } from '@mui/material';
import { type FC, useState, type MouseEvent } from 'react';

interface IFilterItemOperatorProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

const StyledOperator = styled('button')(({ theme }) => ({
    borderRadius: 0,
    border: 'none',
    cursor: 'pointer',
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    padding: theme.spacing(0, 0.75),
    margin: theme.spacing(0, 0, 0, 0.75),
    height: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    transform: `translateY(${theme.spacing(0.5)})`,
}));

const formatOption = (option: string) =>
    option.replaceAll('_', ' ').toLocaleLowerCase();

export const FilterItemOperator: FC<IFilterItemOperatorProps> = ({
    options,
    value,
    onChange,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick =
        (option: string) => (event: MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            onChange(option);
            handleClose();
        };

    return (
        <>
            <StyledOperator onClick={handleClick}>
                {formatOption(value)}
            </StyledOperator>
            <StyledMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorPosition={{ left: 0, top: 1 }}
                onClick={(event) => event.stopPropagation()}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option}
                        onClick={handleMenuItemClick(option)}
                    >
                        {formatOption(option)}
                    </MenuItem>
                ))}
            </StyledMenu>
        </>
    );
};
