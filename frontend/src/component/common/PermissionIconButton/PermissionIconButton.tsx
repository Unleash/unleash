import { IconButton, type IconButtonProps } from '@mui/material';
import type React from 'react';
import type { ReactNode } from 'react';
import type { Link } from 'react-router-dom';
import {
    type ITooltipResolverProps,
    TooltipResolver,
} from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';
import { useId } from 'hooks/useId';
import {
    useHasProjectEnvironmentAccess,
    useHasRootAccess,
} from 'hooks/useHasAccess';

interface IPermissionIconButtonProps {
    permission: string | string[];
    projectId?: string;
    environmentId?: string;
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
    hidden?: boolean;
    type?: 'button';
    edge?: IconButtonProps['edge'];
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
    sx?: IconButtonProps['sx'];
    size?: 'small' | 'medium' | 'large';
}

interface IButtonProps extends IPermissionIconButtonProps {
    onClick: (event: React.SyntheticEvent) => void;
    style?: React.CSSProperties;
}

interface ILinkProps extends IPermissionIconButtonProps {
    component: typeof Link;
    to: string;
}

const RootPermissionIconButton = (props: IButtonProps | ILinkProps) => {
    const access = useHasRootAccess(
        props.permission,
        props.projectId,
        props.environmentId,
    );

    return <BasePermissionIconButton {...props} access={access} />;
};

const ProjectEnvironmentPermissionIconButton = (
    props: (IButtonProps | ILinkProps) & {
        environmentId: string;
        projectId: string;
    },
) => {
    const access = useHasProjectEnvironmentAccess(
        props.permission,
        props.projectId,
        props.environmentId,
    );

    return <BasePermissionIconButton {...props} access={access} />;
};

const BasePermissionIconButton = ({
    access,
    permission,
    projectId,
    children,
    environmentId,
    tooltipProps,
    disabled,
    ...rest
}: (IButtonProps | ILinkProps) & { access: boolean }) => {
    const id = useId();

    return (
        <TooltipResolver
            {...tooltipProps}
            title={formatAccessText(access, tooltipProps?.title)}
            arrow
            onClick={(e) => e.preventDefault()}
        >
            <div id={id}>
                <IconButton
                    {...rest}
                    disabled={!access || disabled}
                    aria-labelledby={id}
                    size={rest.size || 'large'}
                >
                    {children}
                </IconButton>
            </div>
        </TooltipResolver>
    );
};

const PermissionIconButton = (props: IButtonProps | ILinkProps) => {
    if (
        typeof props.projectId !== 'undefined' &&
        typeof props.environmentId !== 'undefined'
    ) {
        return (
            <ProjectEnvironmentPermissionIconButton
                {...props}
                projectId={props.projectId}
                environmentId={props.environmentId}
            />
        );
    }

    return <RootPermissionIconButton {...props} />;
};

export default PermissionIconButton;
