import React, { SyntheticEvent } from 'react';
import {
    Avatar,
    Box,
    IconButton,
    ListItem,
    Menu,
    MenuItem,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IFeatureStrategy } from '../../../../../../../../../../interfaces/strategy';
import { FeatureStrategyRemove } from '../../../../../../../../FeatureStrategy/FeatureStrategyRemove/FeatureStrategyRemove';
import { DisableEnableStrategy } from '../DisableEnableStrategy/DisableEnableStrategy';

export interface IRemoveStrategyMenuProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: IFeatureStrategy;
}

const StyledContainer = styled(ListItem)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 'fit-content',
    padding: theme.spacing(0, 2),
}));

const RemoveStrategyMenu = ({
    projectId,
    strategy,
    featureId,
    environmentId,
}: IRemoveStrategyMenuProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (event: SyntheticEvent) => {
        setAnchorEl(null);
        event.stopPropagation();
    };
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Tooltip title="More actions">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        aria-controls={open ? 'actions-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <MoreVertIcon sx={{ width: 32, height: 32 }} />
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="actions-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        pl: 0.5,
                        minWidth: 'fit-content',
                        justifyContent: 'center',
                        li: {
                            pl: 0,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    component={() => (
                        <StyledContainer>
                            <DisableEnableStrategy
                                projectId={projectId}
                                featureId={featureId}
                                environmentId={environmentId}
                                strategy={strategy}
                                text
                            />
                        </StyledContainer>
                    )}
                />
                <MenuItem
                    component={() => (
                        <FeatureStrategyRemove
                            projectId={projectId}
                            featureId={featureId}
                            environmentId={environmentId}
                            strategyId={strategy.id}
                            text
                            icon
                        />
                    )}
                />
            </Menu>
        </>
    );
};

export default RemoveStrategyMenu;
