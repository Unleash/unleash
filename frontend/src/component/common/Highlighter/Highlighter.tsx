import { VFC } from 'react';
import { useStyles } from './Highlighter.styles';
import { safeRegExp } from '@server/util/escape-regex';

interface IHighlighterProps {
    search?: string;
    children?: string;
    caseSensitive?: boolean;
}

export const Highlighter: VFC<IHighlighterProps> = ({
    search,
    children,
    caseSensitive,
}) => {
    const { classes } = useStyles();
    if (!children) {
        return null;
    }

    if (!search) {
        return <>{children}</>;
    }

    const regex = safeRegExp(search, caseSensitive ? 'g' : 'gi');

    return (
        <span
            className={classes.highlighter}
            dangerouslySetInnerHTML={{
                __html: children?.replaceAll(regex, '<mark>$&</mark>') || '',
            }}
        />
    );
};
