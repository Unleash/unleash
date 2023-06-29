import React from 'react';
import { useMediaQuery } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ITooltipResolverProps } from '../TooltipResolver/TooltipResolver';

interface IResponsiveButtonProps {
    Icon: React.ElementType;
    endIcon?: React.ReactNode;
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
    onClick: () => void;
    disabled?: boolean;
    permission: string | string[];
    projectId?: string;
    environmentId?: string;
    maxWidth: string;
    className?: string;
}

const ResponsiveButton: React.FC<IResponsiveButtonProps> = ({
    Icon,
    onClick,
    maxWidth,
    disabled = false,
    children,
    permission,
    environmentId,
    projectId,
    endIcon,
    ...rest
}) => {
    const smallScreen = useMediaQuery(`(max-width:${maxWidth})`);

    return (
        <ConditionallyRender
            condition={smallScreen}
            show={
                <PermissionIconButton
                    disabled={disabled}
                    onClick={onClick}
                    permission={permission}
                    projectId={projectId}
                    environmentId={environmentId}
                    data-loading
                    {...rest}
                >
                    <Icon />
                </PermissionIconButton>
            }
            elseShow={
                <PermissionButton
                    onClick={onClick}
                    permission={permission}
                    projectId={projectId}
                    color="primary"
                    variant="contained"
                    disabled={disabled}
                    environmentId={environmentId}
                    endIcon={endIcon}
                    data-loading
                    {...rest}
                >
                    {children}
                </PermissionButton>
            }
        />
    );
};

export default ResponsiveButton;
