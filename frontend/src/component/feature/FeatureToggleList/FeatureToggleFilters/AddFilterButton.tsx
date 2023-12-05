import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IFilterItem } from './FeatureToggleFilters';
import { Box, styled } from '@mui/material';
import { Add } from '@mui/icons-material';

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(-1, 0, -1, 0),
    padding: theme.spacing(1.25),
}));
interface IAddFilterButtonProps {
    availableFilters: IFilterItem[];
    setAvailableFilters: (filters: IFilterItem[]) => void;
}

const AddFilterButton = ({
    availableFilters,
    setAvailableFilters,
}: IAddFilterButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onClick = (label: string) => {
        const filters = availableFilters.map((filter) =>
            filter.label === label
                ? {
                      ...filter,
                      enabled: true,
                  }
                : filter,
        );
        setAvailableFilters(filters);
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
                {availableFilters.map(
                    (filter) =>
                        !filter.enabled && (
                            <MenuItem
                                key={filter.label}
                                onClick={() => onClick(filter.label)}
                            >
                                {filter.label}
                            </MenuItem>
                        ),
                )}
            </Menu>
        </div>
    );
};

export default AddFilterButton;
