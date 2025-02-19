import { Button, Checkbox, Menu, MenuItem, styled } from '@mui/material';
import { useState, type FC } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

type EnvironmentVisibilityMenuProps = {
    environments: Array<{ name: string }>;
    hiddenEnvironments: string[];
    onChange: (name: string) => void;
};

const buttonId = 'environment-visibility-button';
const menuId = 'environment-visibility-menu';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(4),
}));

export const EnvironmentVisibilityMenu: FC<EnvironmentVisibilityMenuProps> = ({
    environments,
    hiddenEnvironments,
    onChange,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);
    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <StyledContainer>
            <Button
                onClick={handleOpen}
                endIcon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                variant='outlined'
                id={buttonId}
                aria-controls={isOpen ? menuId : undefined}
                aria-haspopup='true'
                aria-expanded={isOpen ? 'true' : undefined}
                data-loading
            >
                Hide/show environments
            </Button>
            <Menu
                id={menuId}
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
                MenuListProps={{ 'aria-labelledby': buttonId }}
            >
                {environments.map(({ name }) => (
                    <MenuItem key={name} onClick={() => onChange(name)}>
                        <Checkbox
                            onChange={() => onChange(name)}
                            checked={!hiddenEnvironments?.includes(name)}
                        />
                        {name}
                    </MenuItem>
                ))}
            </Menu>
        </StyledContainer>
    );
};
