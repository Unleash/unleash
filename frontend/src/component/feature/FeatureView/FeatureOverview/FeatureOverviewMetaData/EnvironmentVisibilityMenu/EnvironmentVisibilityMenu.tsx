import { Button, styled } from '@mui/material';
import { useState, type FC } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DropdownList } from 'component/common/DialogFormTemplate/ConfigButtons/DropdownList';
import {
    StyledDropdown,
    StyledPopover,
} from 'component/common/DialogFormTemplate/ConfigButtons/ConfigButton.styles';

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

    const allEnvironments = environments.map((environment) => environment.name);

    const selectedOptions = new Set(
        allEnvironments.filter(
            (environment) => !hiddenEnvironments.includes(environment),
        ),
    );

    const handleToggle = (value: string) => {
        onChange(value);
    };

    return (
        <StyledContainer>
            <Button
                onClick={handleOpen}
                endIcon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                variant='outlined'
                id={buttonId}
                aria-controls={menuId}
                aria-haspopup='true'
                aria-expanded={isOpen ? 'true' : undefined}
                data-loading
            >
                Hide/show environments
            </Button>

            <StyledPopover
                id={menuId}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <StyledDropdown>
                    <DropdownList
                        multiselect={{
                            selectedOptions,
                        }}
                        onChange={handleToggle}
                        options={allEnvironments.map((env) => ({
                            label: env,
                            value: env,
                        }))}
                        search={{
                            label: 'Filter environments',
                            placeholder: 'Filter environments',
                        }}
                    />
                </StyledDropdown>
            </StyledPopover>
        </StyledContainer>
    );
};
