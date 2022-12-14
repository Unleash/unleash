import { Button, ButtonProps } from '@mui/material';
import { Lock } from '@mui/icons-material';
import React from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    TooltipResolver,
    ITooltipResolverProps,
} from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';
import { useId } from 'hooks/useId';
import {
    useHasRootAccess,
    useHasProjectEnvironmentAccess,
} from 'hooks/useHasAccess';

export interface IPermissionButtonProps extends Omit<ButtonProps, 'title'> {
    permission: string | string[];
    onClick?: (e: any) => void;
    disabled?: boolean;
    projectId?: string;
    environmentId?: string;
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
}

interface IPermissionBaseButtonProps extends IPermissionButtonProps {
    access: boolean;
}

export interface IProjectPermissionButtonProps extends IPermissionButtonProps {
    projectId: string;
    environmentId: string;
}

const ProjectEnvironmentPermissionButton: React.FC<IProjectPermissionButtonProps> =
    React.forwardRef((props, ref) => {
        const access = useHasProjectEnvironmentAccess(
            props.permission,
            props.projectId,
            props.environmentId
        );

        return <BasePermissionButton {...props} access={access} ref={ref} />;
    });

const RootPermissionButton: React.FC<IPermissionButtonProps> = React.forwardRef(
    (props, ref) => {
        const access = useHasRootAccess(
            props.permission,
            props.projectId,
            props.environmentId
        );

        return <BasePermissionButton {...props} access={access} ref={ref} />;
    }
);

const BasePermissionButton: React.FC<IPermissionBaseButtonProps> =
    React.forwardRef(
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
                ...rest
            },
            ref
        ) => {
            const id = useId();

            return (
                <TooltipResolver
                    {...tooltipProps}
                    title={formatAccessText(access, tooltipProps?.title)}
                    arrow
                >
                    <span id={id}>
                        <Button
                            ref={ref}
                            onClick={onClick}
                            disabled={disabled || !access}
                            aria-labelledby={id}
                            variant={variant}
                            color={color}
                            {...rest}
                            endIcon={
                                <>
                                    <ConditionallyRender
                                        condition={!access}
                                        show={<Lock titleAccess="Locked" />}
                                        elseShow={
                                            Boolean(rest.endIcon) &&
                                            rest.endIcon
                                        }
                                    />
                                </>
                            }
                        >
                            {children}
                        </Button>
                    </span>
                </TooltipResolver>
            );
        }
    );

const PermissionButton: React.FC<IPermissionButtonProps> = React.forwardRef(
    (props, ref) => {
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
    }
);

export default PermissionButton;
