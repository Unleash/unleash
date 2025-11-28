import { Button, styled, type ButtonProps } from '@mui/material';
import Lock from '@mui/icons-material/Lock';
import React from 'react';
import {
    TooltipResolver,
    type ITooltipResolverProps,
} from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';
import { useId } from 'hooks/useId';
import {
    useHasRootAccess,
    useHasProjectEnvironmentAccess,
} from 'hooks/useHasAccess';

const StyledButton = styled(Button)({
    justifySelf: 'start',
    alignSelf: 'start',
    '&.Mui-disabled': {
        pointerEvents: 'auto',
    },
});

export interface IPermissionButtonProps extends Omit<ButtonProps, 'title'> {
    permission: string | string[];
    onClick?: (e: any) => void;
    disabled?: boolean;
    projectId?: string;
    environmentId?: string;
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
    hideLockIcon?: boolean;
    children?: React.ReactNode;
}

interface IPermissionBaseButtonProps extends IPermissionButtonProps {
    access: boolean;
}

export interface IProjectPermissionButtonProps extends IPermissionButtonProps {
    projectId: string;
    environmentId: string;
}

const getEndIcon = (
    access: boolean,
    fallBackIcon?: React.ReactNode,
    hideLockIcon?: boolean,
): React.ReactNode => {
    if (!access && !hideLockIcon) {
        return <Lock titleAccess='Locked' />;
    }

    if (fallBackIcon) {
        return fallBackIcon;
    }

    return null;
};

const ProjectEnvironmentPermissionButton = React.forwardRef<
    HTMLButtonElement,
    IProjectPermissionButtonProps
>((props, ref) => {
    const access = useHasProjectEnvironmentAccess(
        props.permission,
        props.projectId,
        props.environmentId,
    );

    return <BasePermissionButton {...props} access={access} ref={ref} />;
});

const RootPermissionButton = React.forwardRef<
    HTMLButtonElement,
    IPermissionButtonProps
>((props, ref) => {
    const access = useHasRootAccess(
        props.permission,
        props.projectId,
        props.environmentId,
    );

    return <BasePermissionButton {...props} access={access} ref={ref} />;
});

const BasePermissionButton = React.forwardRef<
    HTMLButtonElement,
    IPermissionBaseButtonProps
>(
    (
        {
            permission,
            access,
            variant = 'contained',
            color = 'primary',
            onClick,
            children,
            disabled,
            projectId,
            environmentId,
            tooltipProps,
            hideLockIcon,
            className,
            ...rest
        },
        ref,
    ) => {
        const disableButton = disabled || !access;
        const id = useId();
        const endIcon = getEndIcon(access, rest.endIcon, hideLockIcon);

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (disableButton) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            onClick?.(e);
        };

        return (
            <TooltipResolver
                {...tooltipProps}
                title={formatAccessText(access, tooltipProps?.title)}
                arrow
            >
                <StyledButton
                    ref={ref}
                    onClick={handleClick}
                    aria-disabled={disableButton || undefined}
                    aria-labelledby={id}
                    variant={variant}
                    color={color}
                    className={
                        disableButton ? `${className} Mui-disabled` : className
                    }
                    {...rest}
                    endIcon={endIcon}
                >
                    {children}
                </StyledButton>
            </TooltipResolver>
        );
    },
);

const PermissionButton = React.forwardRef<
    HTMLButtonElement,
    IPermissionButtonProps
>((props, ref) => {
    if (
        typeof props.projectId !== 'undefined' &&
        typeof props.environmentId !== 'undefined'
    ) {
        return (
            <ProjectEnvironmentPermissionButton
                {...props}
                environmentId={props.environmentId}
                projectId={props.projectId}
                ref={ref}
            />
        );
    }
    return <RootPermissionButton {...props} ref={ref} />;
});

export default PermissionButton;
