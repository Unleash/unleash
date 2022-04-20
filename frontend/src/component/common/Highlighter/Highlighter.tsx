interface IHighlighterProps {
    search: string;
    children: string;
    caseSensitive?: boolean;
}

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const Highlighter = ({
    search,
    children,
    caseSensitive,
}: IHighlighterProps) => {
    const regex = new RegExp(escapeRegex(search), caseSensitive ? 'g' : 'gi');

    return (
        <span
            dangerouslySetInnerHTML={{
                __html: children?.replaceAll(regex, '<mark>$&</mark>') || '',
            }}
        />
    );
};
