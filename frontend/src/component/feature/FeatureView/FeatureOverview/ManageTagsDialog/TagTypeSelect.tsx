import {
    type AutocompleteProps,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import type { ITagType } from 'interfaces/tags';
import type { HTMLAttributes, JSX } from 'react';
import { AutocompleteField } from 'component/common/AutocompleteField/AutocompleteField';

interface ITagSelect {
    options: ITagType[];
    value: ITagType;
    disabled?: boolean;
    onChange: AutocompleteProps<ITagType, false, any, any>['onChange'];
}

const ListItem = styled('li')({
    flexDirection: 'column',
});

export const TagTypeSelect = ({
    options,
    value,
    disabled = false,
    onChange,
}: ITagSelect) => {
    const theme = useTheme();

    return (
        <AutocompleteField
            label='Tag type'
            sx={{ width: 500 }}
            disablePortal
            disabled={disabled}
            id='tag-type-select'
            options={options}
            disableClearable
            value={value}
            getOptionLabel={(option) => option.name}
            onChange={onChange}
            slotProps={{
                listbox: { style: { maxHeight: 200, overflow: 'auto' } },
            }}
            renderOption={(
                {
                    key,
                    ...props
                }: JSX.IntrinsicAttributes & HTMLAttributes<HTMLLIElement>,
                option,
            ) => (
                <ListItem
                    key={key}
                    {...props}
                    style={{
                        alignItems: 'flex-start',
                        gap: theme.spacing(0.5),
                    }}
                >
                    <Typography variant='body1'>{option.name}</Typography>
                    <Typography variant='caption'>
                        {option.description}
                    </Typography>
                </ListItem>
            )}
        />
    );
};
