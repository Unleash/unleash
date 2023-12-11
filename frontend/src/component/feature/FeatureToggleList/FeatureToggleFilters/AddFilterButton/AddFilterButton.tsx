import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IFilterVisibility, IFilterItem } from '../FeatureToggleFilters';
import { Box, styled } from '@mui/material';
import { Add } from '@mui/icons-material';

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(-1, 0, -1, 0),
    padding: theme.spacing(1.25),
}));
interface IAddFilterButtonProps {
    visibleFilters: IFilterVisibility;
    setVisibleFilters: (filters: IFilterVisibility) => void;
}

const AddFilterButton = ({
    visibleFilters,
    setVisibleFilters,
}: IAddFilterButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onClick = (label: string) => {
        const filterVisibility = {
            ...visibleFilters,
            [label]: true,
        };
        setVisibleFilters(filterVisibility);
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
                {Object.entries(visibleFilters).map(([label, enabled]) =>
                    !enabled ? (
                        <MenuItem key={label} onClick={() => onClick(label)}>
                            {label}
                        </MenuItem>
                    ) : null,
                )}
            </Menu>
        </div>
    );
};

export default AddFilterButton;
