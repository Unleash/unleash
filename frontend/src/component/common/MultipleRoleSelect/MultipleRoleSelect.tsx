import {
    Autocomplete,
    AutocompleteProps,
    TextField,
    styled,
} from '@mui/material';
import { IRole } from '../../../interfaces/role';
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

interface IMultipleRoleSelectProps extends Partial<AutocompleteProps<IRole, true, false, false>> {
    roles: IRole[];
    value: IRole[] | undefined;
    setValue: (role: IRole[]) => void;
    required?: boolean;
}

export const MultipleRoleSelect = ({
    roles, value, setValue, required, ...rest
}: IMultipleRoleSelectProps) => {
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
                multiple
                openOnFocus
                size="small"
                value={value}
                onChange={(_, roles) => setValue(roles)}
                options={roles}
                renderOption={renderRoleOption}
                getOptionLabel={option => option.name}
                renderInput={params => (
                    <TextField {...params} label="Role" required={required} />
                )}
                {...rest}
                />
            <ConditionallyRender
                condition={value !== undefined}
                show={() => (
                    value!.map((r) =>
                    <RoleDescription sx={{ marginTop: 1 }} roleId={r!.id} />
                ))}
            />
        </>
    )
}
