import type React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Icon, styled } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { Box } from '@mui/system';
import type { IFilterItem } from './Filters/Filters';
import { FILTERS_MENU } from '../../utils/testIds';

const StyledButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(0, 1.25, 0, 1.25),
    height: theme.spacing(3.75),
}));

const StyledIconContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(Icon)(({ theme }) => ({
    color: theme.palette.action.active,
    '&.material-symbols-outlined': {
        fontSize: theme.spacing(2),
    },
}));

interface IAddFilterButtonProps {
    visibleOptions: string[];
    setVisibleOptions: (filters: string[]) => void;
    hiddenOptions: string[];
    setHiddenOptions: (filters: string[]) => void;
    availableFilters: IFilterItem[];
}

export const AddFilterButton = ({
    visibleOptions,
    setVisibleOptions,
    hiddenOptions,
    setHiddenOptions,
    availableFilters,
}: IAddFilterButtonProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onSelect = (label: string) => {
        const newVisibleOptions = visibleOptions.filter((f) => f !== label);
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
                data-testid={FILTERS_MENU}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {visibleOptions.map((label) => {
                    const filter = availableFilters.find(
                        (f) => f.label === label,
                    );
                    return (
                        <MenuItem key={label} onClick={() => onSelect(label)}>
                            <StyledIconContainer>
                                <StyledIcon>{filter?.icon}</StyledIcon>
                                {label}
                            </StyledIconContainer>
                        </MenuItem>
                    );
                })}
            </Menu>
        </div>
    );
};
