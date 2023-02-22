import { styled, Typography } from '@mui/material';
interface IDividerTextProps {
    text: string;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(2, 'auto'),
}));

const StyledSpan = styled('span')(({ theme }) => ({
    width: '80px',
    height: '3px',
    backgroundColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
}));

const StyleTypography = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    display: 'block',
    margin: theme.spacing(0, 2),
}));

const DividerText = ({ text, ...rest }: IDividerTextProps) => {
    return (
        <StyledContainer {...rest}>
            <StyledSpan />
            <StyleTypography variant="body2">{text}</StyleTypography>
            <StyledSpan />
        </StyledContainer>
    );
};

export default DividerText;
