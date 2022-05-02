import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import React, { useState, VFC } from 'react';

const PasswordField: VFC<TextFieldProps> = ({ ...rest }) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
    };

    const IconComponent = showPassword ? Visibility : VisibilityOff;
    const iconTitle = 'Toggle password visibility';

    return (
        <TextField
            variant="outlined"
            size="small"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
                style: {
                    paddingRight: '0px',
                },
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                        >
                            <IconComponent titleAccess={iconTitle} />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            {...rest}
        />
    );
};

export default PasswordField;
