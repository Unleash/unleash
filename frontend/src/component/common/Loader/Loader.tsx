import logo from 'assets/img/unleashLogoIconDarkAlpha.gif';
import { formatAssetPath } from 'utils/formatPath';
import { styled } from '@mui/material';
import type { FC } from 'react';

type LoaderProps = {
    type?: 'fullscreen' | 'inline';
};

const StyledDiv = styled('div', {
    shouldForwardProp: (prop) => prop !== 'type',
})<{ type: LoaderProps['type'] }>(({ theme, type }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: type === 'fullscreen' ? '100vh' : '100%',
    backgroundColor: theme.palette.background.paper,
}));

const StyledImg = styled('img')(({ theme }) => ({
    width: '100px',
    height: '100px',
}));

const Loader: FC<LoaderProps> = ({ type = 'inline' }) => {
    return (
        <StyledDiv role='alert' aria-label='Loading' type={type}>
            <StyledImg src={formatAssetPath(logo)} alt='' />
        </StyledDiv>
    );
};

export default Loader;
