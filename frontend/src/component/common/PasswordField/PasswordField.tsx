import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
                            size="large"
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
