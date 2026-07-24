import { type AutocompleteProps, styled } from '@mui/material';
import type { IRole } from 'interfaces/role';
import { RoleDescription } from '../RoleDescription/RoleDescription.tsx';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';
import { AutocompleteField } from '../AutocompleteField/AutocompleteField';
import type { ReactNode } from 'react';

const StyledRoleOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span:last-of-type': {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.text.secondary,
    },
}));

interface IRoleSelectProps
    extends Partial<
        Omit<AutocompleteProps<IRole, false, false, false>, 'renderInput'>
    > {
    roles: IRole[];
    value: IRole | null;
    setValue: (role: IRole | null) => void;
    required?: boolean;
    hideDescription?: boolean;
    description?: ReactNode;
}

export const RoleSelect = ({
    roles,
    value,
    setValue,
    required,
    hideDescription,
    description,
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
            <AutocompleteField
                label='Role'
                description={description}
                required={required}
                openOnFocus
                size='small'
                value={value}
                onChange={(_, role) => setValue(role || null)}
                options={roles}
                renderOption={renderRoleOption}
                getOptionLabel={(option) => option.name}
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
