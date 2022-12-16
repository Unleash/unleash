import { styled } from '@mui/material';
import mermaid from 'mermaid';
import { useEffect } from 'react';

const StyledMermaid = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    '#mermaid .edgeLabel': {
        backgroundColor: theme.palette.background.paper,
    },
}));

mermaid.initialize({
    theme: 'default',
    themeCSS: `
    .clusters #_ rect {
        fill: transparent;
        stroke: transparent;
    }
    `,
});

interface IMermaidProps {
    className?: string;
    children: string;
}

export const Mermaid = ({ className = '', children }: IMermaidProps) => {
    useEffect(() => {
        mermaid.render('mermaid', children, (svgCode: string) => {
            const mermaidDiv = document.querySelector('.mermaid');
            if (mermaidDiv) {
                mermaidDiv.innerHTML = svgCode;
            }
        });
    }, [children]);

    return (
        <StyledMermaid className={`mermaid ${className}`}>
            {children}
        </StyledMermaid>
    );
};
