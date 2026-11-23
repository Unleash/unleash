import { useRef } from 'react';
import { CommandBarPanel } from './CommandBarPanel.tsx';
import { useCommandBarHotkey } from './useCommandBarHotkey.ts';

export const InlineCommandBar = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useCommandBarHotkey([containerRef], () => {
        if (document.activeElement === inputRef.current) {
            inputRef.current?.blur();
        } else {
            inputRef.current?.focus();
        }
    });

    return (
        <CommandBarPanel
            variant='inline'
            containerRef={containerRef}
            inputRef={inputRef}
        />
    );
};
