import { VFC } from 'react';
import { safeRegExp } from '@server/util/escape-regex';
import { styled } from '@mui/material';

interface IHighlighterProps {
    search?: string;
    children?: string;
    caseSensitive?: boolean;
}

export const StyledSpan = styled('span')(({ theme }) => ({
    '&>mark': {
        backgroundColor: theme.palette.highlight,
    },
}));

export const Highlighter: VFC<IHighlighterProps> = ({
    search,
    children,
    caseSensitive,
}) => {
    if (!children) {
        return null;
    }

    if (!search) {
        return <>{children}</>;
    }

    const regex = safeRegExp(search, caseSensitive ? 'g' : 'gi');

    return (
        <StyledSpan
            dangerouslySetInnerHTML={{
                __html: children?.replaceAll(regex, '<mark>$&</mark>') || '',
            }}
        />
    );
};
