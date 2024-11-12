import type React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Icon, styled } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { Box } from '@mui/system';
import type { IFilterItem } from './Filters/Filters';
import { FILTERS_MENU } from 'utils/testIds';
import { useUiFlag } from 'hooks/useUiFlag';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

const StyledButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(0, 1.25, 0, 1.25),
    height: theme.spacing(3.75),
}));

const StyledHtmlTooltip = styled(HtmlTooltip)(({ theme }) => ({
    zIndex: 1200,
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
    const projectId = useOptionalPathParam('projectId');
    const simplifyProjectOverview = useUiFlag('simplifyProjectOverview');
    const { user } = useAuthUser();
    const { setSplashSeen } = useSplashApi();
    const { splash } = useAuthSplash();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [archiveTooltipOpen, setArchiveTooltipOpen] = useState(
        !splash?.simplifyProjectOverview,
    );

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

    const isOldCustomer = (createdAt: string | undefined) => {
        if (!createdAt) return false;
        const cutoffDate = new Date('2024-11-08T00:00:00.000Z');
        return new Date(createdAt) < cutoffDate;
    };

    const showArchiveTooltip =
        simplifyProjectOverview && projectId && isOldCustomer(user?.createdAt);

    const ArchiveTooltip = () => {
        return (
            <Box>
                <Box>
                    Archived flags are now accessible via the{' '}
                    <b>Show only archived</b> filter option.
                </Box>
                <Box
                    onClick={() => {
                        setArchiveTooltipOpen(false);
                        setSplashSeen('simplifyProjectOverview');
                    }}
                    sx={(theme) => ({
                        color: theme.palette.primary.dark,
                        cursor: 'pointer',
                    })}
                >
                    Got it
                </Box>
            </Box>
        );
    };
    return (
        <div>
            {showArchiveTooltip ? (
                <StyledHtmlTooltip
                    placement='right'
                    arrow
                    title={<ArchiveTooltip />}
                    describeChild
                    open={archiveTooltipOpen}
                >
                    <StyledButton onClick={handleClick} startIcon={<Add />}>
                        Add Filter
                    </StyledButton>
                </StyledHtmlTooltip>
            ) : (
                <StyledButton onClick={handleClick} startIcon={<Add />}>
                    Add Filter
                </StyledButton>
            )}

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
