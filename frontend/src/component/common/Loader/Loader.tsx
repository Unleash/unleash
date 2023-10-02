import logo from 'assets/img/unleashLogoIconDarkAlpha.gif';
import { formatAssetPath } from 'utils/formatPath';
import { styled } from '@mui/material';

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.paper,
}));

const StyledImg = styled('img')(({ theme }) => ({
    width: '100px',
    height: '100px',
}));

const Loader = () => {
    return (
        <StyledDiv role="alert" aria-label="Loading">
            <StyledImg src={formatAssetPath(logo)} alt="" />
        </StyledDiv>
    );
};

export default Loader;
