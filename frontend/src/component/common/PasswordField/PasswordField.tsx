import {
    IconButton,
    InputAdornment,
    styled,
    TextField,
    type TextFieldProps,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type React from 'react';
import { useState, type VFC } from 'react';

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& input': {
        boxShadow: `transparent 0px 0px 0px 1px inset, ${theme.palette.background.paper} 0px 0px 0px 100px inset`,
        WebkitTextFillColor: theme.palette.text.primary,
        caretColor: theme.palette.text.primary,
    },
}));

const PasswordField: VFC<TextFieldProps> = ({ ...rest }) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
    };

    const IconComponent = showPassword ? Visibility : VisibilityOff;
    const iconTitle = 'Toggle password visibility';

    return (
        <StyledTextField
            variant='outlined'
            size='small'
            type={showPassword ? 'text' : 'password'}
            InputProps={{
                style: {
                    paddingRight: '0px',
                },
                endAdornment: (
                    <InputAdornment position='end'>
                        <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            size='large'
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
