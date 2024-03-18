import type { VFC } from 'react';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { RoleDescription } from 'component/common/RoleDescription/RoleDescription';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { styled } from '@mui/material';

const StyledRoleDescriptions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    '& > *:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingBottom: theme.spacing(1),
    },
}));

type TSingleRoleProps = {
    value: string;
    role: number;
    roles?: never;
};

type TMultipleRolesProps = {
    value: string;
    roles: number[];
    role?: never;
};

type TRoleCellProps = TSingleRoleProps | TMultipleRolesProps;

export const RoleCell: VFC<TRoleCellProps> = ({ role, roles, value }) => {
    const { isEnterprise } = useUiConfig();

    if (isEnterprise()) {
        const rolesArray = roles ? roles : [role];

        return (
            <TextCell>
                <TooltipLink
                    tooltip={
                        <StyledRoleDescriptions>
                            {rolesArray.map((roleId) => (
                                <RoleDescription
                                    key={roleId}
                                    roleId={roleId}
                                    tooltip
                                />
                            ))}
                        </StyledRoleDescriptions>
                    }
                >
                    {value}
                </TooltipLink>
            </TextCell>
        );
    }

    return <TextCell>{value}</TextCell>;
};
