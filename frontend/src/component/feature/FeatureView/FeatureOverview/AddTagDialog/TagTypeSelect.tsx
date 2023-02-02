import React from 'react';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';
import {
    Autocomplete,
    AutocompleteProps,
    styled,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { ITagType } from '../../../../../interfaces/tags';

interface ITagSelect {
    value: ITagType;
    onChange: AutocompleteProps<ITagType, false, any, any>['onChange'];
    autoFocus?: boolean;
}

const ListItem = styled('li')({
    flexDirection: 'column',
});
const TagTypeSelect = ({ value, onChange, ...rest }: ITagSelect) => {
    const { tagTypes } = useTagTypes();
    const theme = useTheme();

    return (
        <>
            <Autocomplete
                {...rest}
                disablePortal
                id="tag-type-select"
                options={tagTypes}
                getOptionLabel={option => option.name}
                renderOption={(props, option) => (
                    <ListItem
                        {...props}
                        style={{
                            alignItems: 'flex-start',
                            gap: theme.spacing(0.5),
                        }}
                    >
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption">
                            {option.description}
                        </Typography>
                    </ListItem>
                )}
                sx={{ width: 500 }}
                renderInput={params => (
                    <TextField {...params} label="Select type" />
                )}
                onChange={onChange}
            />
        </>
    );
};

export default TagTypeSelect;
