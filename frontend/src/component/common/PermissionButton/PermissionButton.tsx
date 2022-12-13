import { Button, ButtonProps } from '@mui/material';
import { Lock } from '@mui/icons-material';
import AccessContext from 'contexts/AccessContext';
import React, { useContext } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    TooltipResolver,
    ITooltipResolverProps,
} from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';
import { useId } from 'hooks/useId';
import { useHasAccess } from '../../../hooks/useHasAccess';

export interface IPermissionButtonProps extends Omit<ButtonProps, 'title'> {
    permission: string | string[];
    onClick?: (e: any) => void;
    disabled?: boolean;
    projectId?: string;
    environmentId?: string;
    tooltipProps?: Omit<ITooltipResolverProps, 'children'>;
}

const PermissionButton: React.FC<IPermissionButtonProps> = React.forwardRef(
    (
        {
            permission,
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
        const access = useHasAccess(permission, environmentId, projectId);

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
                                        Boolean(rest.endIcon) && rest.endIcon
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

export default PermissionButton;
