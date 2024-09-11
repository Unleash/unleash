import { Markdown } from 'component/common/Markdown/Markdown';

export const AIMessage = ({ children }: { children: string }) => (
    <Markdown>{children}</Markdown>
);
