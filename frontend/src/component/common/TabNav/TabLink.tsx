import { styled } from '@mui/material';
import type React from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { SteadyWidthText } from 'component/common/SteadyWidthText/SteadyWidthText';

const StyledTabLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    textDecoration: 'none',
    color: 'inherit',
    padding: theme.spacing(0, 2), // 16px horizontal, matches the tab scale
    // Bold when the parent tab is selected. Higher specificity than the global
    // `a { font-weight: medium }` baseline, which would otherwise win. Paired
    // with SteadyWidthText below so the weight change doesn't shift layout.
    '.MuiTab-root.Mui-selected &': {
        fontWeight: theme.typography.fontWeightBold,
    },
}));

interface ICenteredTabLinkProps {
    to: string;
    children?: React.ReactNode;
}

export const TabLink: FC<ICenteredTabLinkProps> = ({ to, children }) => (
    <StyledTabLink to={to}>
        <SteadyWidthText>{children}</SteadyWidthText>
    </StyledTabLink>
);
