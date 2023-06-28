import {
    Autocomplete,
    AutocompleteProps,
    TextField,
    styled,
} from '@mui/material';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import { IRole, PredefinedRoleType } from 'interfaces/role';
import { RoleDescription } from '../RoleDescription/RoleDescription';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

const StyledRoleOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:last-of-type': {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.text.secondary,
    },
}));

interface IRoleSelectProps
    extends Partial<AutocompleteProps<IRole, false, false, false>> {
    value: IRole | null;
    setValue: (role: IRole | null) => void;
    roles: IRole[];
    required?: boolean;
}

export const RoleSelect = ({
    value,
    setValue,
    required,
    roles,
    ...rest
}: IRoleSelectProps) => {
    const renderRoleOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: IRole
    ) => (
        <li {...props}>
            <StyledRoleOption>
                <span>{option.name}</span>
                <span>{option.description}</span>
            </StyledRoleOption>
        </li>
    );

    return (
        <>
            <Autocomplete
                openOnFocus
                size="small"
                value={value}
                onChange={(_, role) => setValue(role || null)}
                options={roles}
                renderOption={renderRoleOption}
                getOptionLabel={option => option.name}
                renderInput={params => (
                    <TextField {...params} label="Role" required={required} />
                )}
                {...rest}
            />
            <ConditionallyRender
                condition={Boolean(value)}
                show={() => (
                    <RoleDescription sx={{ marginTop: 1 }} roleId={value!.id} />
                )}
            />
        </>
    );
};
