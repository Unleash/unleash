import {
    Box,
    type BoxProps,
    FormControlLabel,
    Switch,
    styled,
} from '@mui/material';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    lineHeight: theme.spacing(2.75),
}));

const StyledControlLabel = styled(FormControlLabel)({
    marginRight: 0,
});

const StyledSwitchSpan = styled('span')(({ theme }) => ({
    marginLeft: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
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
            <StyledControlLabel
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
