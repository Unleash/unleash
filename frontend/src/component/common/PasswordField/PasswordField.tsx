import { IconButton, InputAdornment, TextField } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { useState } from 'react';

const PasswordField = ({ ...rest }) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
    };

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
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            {...rest}
        />
    );
};

export default PasswordField;
