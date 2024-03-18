import { Link } from '@mui/material';
import type { AnchorHTMLAttributes, ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const LinkRenderer = ({
    href = '',
    children,
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const navigate = useNavigate();

    if (href.startsWith('/'))
        return <Link onClick={() => navigate(href)}>{children}</Link>;

    return (
        <Link href={href} target='_blank' rel='noreferrer'>
            {children}
        </Link>
    );
};

export const Markdown = (props: ComponentProps<typeof ReactMarkdown>) => (
    <ReactMarkdown components={{ a: LinkRenderer }} {...props} />
);
