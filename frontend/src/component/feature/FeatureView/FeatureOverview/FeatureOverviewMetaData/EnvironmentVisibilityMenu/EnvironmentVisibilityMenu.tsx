import { Button, Popover, styled } from '@mui/material';
import { useMemo, useState, type FC } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DropdownList } from 'component/common/DialogFormTemplate/ConfigButtons/DropdownList';

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

export const StyledPopover = styled(Popover)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
        paddingTop: theme.spacing(2),
    },
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

    const allEnvironments = useMemo(
        () => environments.map((environment) => environment.name),
        [JSON.stringify(environments)],
    );

    const selectedOptions = useMemo(
        () =>
            new Set(
                allEnvironments.filter(
                    (environment) => !hiddenEnvironments.includes(environment),
                ),
            ),
        [environments, hiddenEnvironments],
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
                        label: '',
                        placeholder: 'Select environment',
                    }}
                />
            </StyledPopover>
        </StyledContainer>
    );
};
