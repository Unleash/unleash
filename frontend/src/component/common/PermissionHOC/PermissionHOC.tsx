import { useContext, FC, ReactElement } from 'react';
import AccessContext from 'contexts/AccessContext';
import {
    ITooltipResolverProps,
    TooltipResolver,
} from 'component/common/TooltipResolver/TooltipResolver';
import { formatAccessText } from 'utils/formatAccessText';

type IPermissionHOCProps = {
    permission: string;
    projectId?: string;
    environmentId?: string;
    tooltip?: string;
    tooltipProps?: Omit<ITooltipResolverProps, 'children' | 'title'>;
    children: ({ hasAccess }: { hasAccess?: boolean }) => ReactElement;
};

export const PermissionHOC: FC<IPermissionHOCProps> = ({
    permission,
    projectId,
    children,
    environmentId,
    tooltip,
    tooltipProps,
}) => {
    const { hasAccess } = useContext(AccessContext);
    let access;

    if (projectId && environmentId) {
        access = hasAccess(permission, projectId, environmentId);
    } else if (projectId) {
        access = hasAccess(permission, projectId);
    } else {
        access = hasAccess(permission);
    }

    return (
        <TooltipResolver
            {...tooltipProps}
            title={formatAccessText(access, tooltip)}
        >
            {children({ hasAccess: access })}
        </TooltipResolver>
    );
};
