import { type FC, type ReactNode, useId } from 'react';
import { styled } from '@mui/material';
import { SidebarList } from './SidebarList.tsx';

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(1.75, 0.5, 0.75),
    fontSize: theme.typography.caption.fontSize,
    lineHeight: '16px',
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
}));

export const SidebarSection: FC<{ title: string; children: ReactNode }> = ({
    title,
    children,
}) => {
    const titleId = useId();

    return (
        <section aria-labelledby={titleId}>
            <StyledTitle id={titleId}>{title}</StyledTitle>
            <SidebarList>{children}</SidebarList>
        </section>
    );
};
