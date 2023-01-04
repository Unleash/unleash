import { styled } from '@mui/material';
import mermaid from 'mermaid';
import { useRef, useEffect } from 'react';

const StyledMermaid = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    '#mermaid .edgeLabel': {
        backgroundColor: theme.palette.background.paper,
    },
}));

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeCSS: `
    .clusters #_ rect {
        fill: transparent;
        stroke: transparent;
    }
    `,
});

interface IMermaidProps {
    children: string;
}

export const Mermaid = ({ children, ...props }: IMermaidProps) => {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.render('mermaid', children, svgCode => {
            if (mermaidRef.current) {
                mermaidRef.current.innerHTML = svgCode;
            }
        });
    }, [children]);

    return <StyledMermaid ref={mermaidRef} {...props} />;
};
