import {
    Autocomplete,
    AutocompleteProps,
    TextField,
    styled,
} from '@mui/material';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import IRole from 'interfaces/role';

const StyledRoleOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:last-of-type': {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.text.secondary,
    },
}));

export interface IRoleSelectProps
    extends Partial<AutocompleteProps<IRole, false, false, false>> {
    value: IRole | null;
    setValue: (role: IRole | null) => void;
    required?: boolean;
}

export const RoleSelect = ({
    value,
    setValue,
    required,
    ...rest
}: IRoleSelectProps) => {
    const { roles } = useRoles();

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
        </>
    );
};
