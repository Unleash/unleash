import type { VFC } from 'react';
import { styled } from '@mui/material';
import { Box } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

interface IProjectCardIconProps {
    mode: 'private' | 'protected' | 'public' | string;
}

const StyledVisibilityIcon = styled(VisibilityOffIcon)(({ theme }) => ({
    color: theme.palette.action.disabled,
}));

const StyledLockIcon = styled(LockIcon)(({ theme }) => ({
    color: theme.palette.action.disabled,
}));

const StyledProjectIcon = styled(BarChartIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

export const StyledIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    borderWidth: '1px',
    borderRadius: theme.shape.borderRadius,
    borderStyle: 'solid',
    borderColor: theme.palette.neutral.border,
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(2),
}));

export const ProjectCardIcon: VFC<IProjectCardIconProps> = ({ mode }) => {
    if (mode === 'private') {
        return (
            <StyledIconBox data-loading>
                <HtmlTooltip
                    title="This project's collaboration mode is set to private. The project and associated feature flags can only be seen by members of the project."
                    arrow
                >
                    <StyledVisibilityIcon />
                </HtmlTooltip>
            </StyledIconBox>
        );
    }

    if (mode === 'protected') {
        return (
            <StyledIconBox data-loading>
                <HtmlTooltip
                    title="This project's collaboration mode is set to protected. Only admins and project members can submit change requests."
                    arrow
                >
                    <StyledLockIcon />
                </HtmlTooltip>
            </StyledIconBox>
        );
    }

    return (
        <StyledIconBox data-loading>
            <StyledProjectIcon />
        </StyledIconBox>
    );
};
