import { VFC } from 'react';
import { useStyles } from './Highlighter.styles';

interface IHighlighterProps {
    search?: string;
    children?: string;
    caseSensitive?: boolean;
}

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

    const regex = new RegExp(escapeRegex(search), caseSensitive ? 'g' : 'gi');

    return (
        <span
            className={classes.highlighter}
            dangerouslySetInnerHTML={{
                __html: children?.replaceAll(regex, '<mark>$&</mark>') || '',
            }}
        />
    );
};
