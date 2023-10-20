import { Box, BoxProps, FormControlLabel, Switch, styled } from '@mui/material';
import { Dispatch, ReactNode, SetStateAction } from 'react';

const StyledContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
});

const StyledSwitchSpan = styled('span')(({ theme }) => ({
    marginLeft: theme.spacing(0.5),
}));

interface IFormSwitchProps extends BoxProps {
    checked: boolean;
    setChecked: Dispatch<SetStateAction<boolean>>;
    children?: ReactNode;
}

export const FormSwitch = ({
    checked,
    setChecked,
    children,
    ...props
}: IFormSwitchProps) => {
    return (
        <StyledContainer {...props}>
            {children}
            <FormControlLabel
                control={
                    <Switch
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                }
                label={
                    <StyledSwitchSpan>
                        {checked ? 'Enabled' : 'Disabled'}
                    </StyledSwitchSpan>
                }
            />
        </StyledContainer>
    );
};
