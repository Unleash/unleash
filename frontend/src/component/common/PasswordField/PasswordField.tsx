import { IconButton, InputAdornment, type TextFieldProps } from '@mui/material';
import { StyledAutofillTextField } from 'component/user/StyledAutofillTextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type React from 'react';
import { useState, type FC } from 'react';
import { FormField } from 'component/common/FormField/FormField';

const PasswordField: FC<TextFieldProps> = ({ label, value, ...rest }) => {
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

    const field = (
        <StyledAutofillTextField
            variant='outlined'
            size='small'
            fullWidth={Boolean(label)}
            value={value}
            type={showPassword ? 'text' : 'password'}
            slotProps={{
                input: {
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
                },
            }}
            {...rest}
        />
    );

    if (!label) {
        return field;
    }

    return <FormField label={label}>{field}</FormField>;
};

export default PasswordField;
