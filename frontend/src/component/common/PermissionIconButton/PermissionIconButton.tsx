import { IconButton, IconButtonProps } from '@mui/material';
import React, { ReactNode, useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { Link } from 'react-router-dom';
import {
    ITooltipResolverProps,
    TooltipResolver,
} from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';
import { useId } from 'hooks/useId';
import { useHasAccess } from '../../../hooks/useHasAccess';

interface IPermissionIconButtonProps {
    permission: string;
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
    size?: string;
}

interface IButtonProps extends IPermissionIconButtonProps {
    onClick: (event: React.SyntheticEvent) => void;
}

interface ILinkProps extends IPermissionIconButtonProps {
    component: typeof Link;
    to: string;
}

const PermissionIconButton = ({
    permission,
    projectId,
    children,
    environmentId,
    tooltipProps,
    disabled,
    ...rest
}: IButtonProps | ILinkProps) => {
    const access = useHasAccess(permission, environmentId, projectId);
    const id = useId();

    return (
        <TooltipResolver
            {...tooltipProps}
            title={formatAccessText(access, tooltipProps?.title)}
            arrow
            onClick={e => e.preventDefault()}
        >
            <div id={id}>
                <IconButton
                    {...rest}
                    disabled={!access || disabled}
                    aria-labelledby={id}
                    size="large"
                >
                    {children}
                </IconButton>
            </div>
        </TooltipResolver>
    );
};

export default PermissionIconButton;
