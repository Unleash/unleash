import {
    Autocomplete,
    type AutocompleteProps,
    TextField,
    styled,
} from '@mui/material';
import type { IRole } from 'interfaces/role';
import { RoleDescription } from '../RoleDescription/RoleDescription.tsx';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';

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
    roles: IRole[];
    value: IRole | null;
    setValue: (role: IRole | null) => void;
    required?: boolean;
    hideDescription?: boolean;
}

export const RoleSelect = ({
    roles,
    value,
    setValue,
    required,
    hideDescription,
    ...rest
}: IRoleSelectProps) => {
    const renderRoleOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: IRole,
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
                size='small'
                value={value}
                onChange={(_, role) => setValue(role || null)}
                options={roles}
                renderOption={renderRoleOption}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                    <TextField {...params} label='Role' required={required} />
                )}
                {...rest}
            />
            <ConditionallyRender
                condition={Boolean(value) && !hideDescription}
                show={() => (
                    <RoleDescription sx={{ marginTop: 1 }} roleId={value!.id} />
                )}
            />
        </>
    );
};
