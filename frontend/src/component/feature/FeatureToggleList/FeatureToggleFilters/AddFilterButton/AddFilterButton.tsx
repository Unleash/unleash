import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material';
import { Add } from '@mui/icons-material';

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(-1, 0, -1, 0),
    padding: theme.spacing(1.25),
}));

interface IAddFilterButtonProps {
    visibleOptions: string[];
    setVisibleOptions: (filters: string[]) => void;
    hiddenOptions: string[];
    setHiddenOptions: (filters: string[]) => void;
}

const AddFilterButton = ({
                             visibleOptions,
                             setVisibleOptions,
                             hiddenOptions,
                             setHiddenOptions,
                         }: IAddFilterButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onSelect = (label: string) => {
        const newVisibleOptions = visibleOptions.filter(f => f !== label);
        const newHiddenOptions = [...hiddenOptions, label];

        setHiddenOptions(newHiddenOptions);
        setVisibleOptions(newVisibleOptions);
        handleClose();
    };

    return (
        <div>
            <StyledButton onClick={handleClick} startIcon={<Add />}>
                Add Filter
            </StyledButton>
            <Menu
                id='simple-menu'
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {visibleOptions.map(label =>
                    <MenuItem key={label} onClick={() => onSelect(label)}>
                        {label}
                    </MenuItem>,
                )}
            </Menu>
        </div>
    );
};

export default AddFilterButton;
