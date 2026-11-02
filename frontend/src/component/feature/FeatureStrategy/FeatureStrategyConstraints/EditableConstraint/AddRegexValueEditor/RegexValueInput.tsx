import type { ChangeEvent, FC, KeyboardEvent, ReactNode } from 'react';
import { useId, useState } from 'react';
import { InlineValueChrome } from '../InlineValueChrome.tsx';
import type { SubmitValue } from '../InlineValueInput.tsx';
import { AddRegexValueEditor } from './AddRegexValueEditor.tsx';

type Props = {
    value: string;
    onChange: (value: string) => void;
    onClose: (shouldManageFocus: boolean) => void;
    submitValue: SubmitValue;
    caseInsensitive: boolean;
    helpText?: ReactNode;
};

export const RegexValueInput: FC<Props> = ({
    value,
    onChange,
    onClose,
    submitValue,
    caseInsensitive,
    helpText,
}) => {
    const [error, setError] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const inputId = useId();

    const submit = () => submitValue(value, setError, setAnnouncement);

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        } else if (e.key === 'Escape') {
            e.stopPropagation(); // don't also close an outer dialog
            onClose(true);
        }
    };

    return (
        <InlineValueChrome
            inputId={inputId}
            value={value}
            error={error}
            announcement={announcement}
            helpText={helpText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
                setError('');
            }}
            onKeyDown={onKeyDown}
            onClose={onClose}
            submit={submit}
        >
            <AddRegexValueEditor
                value={value}
                caseInsensitive={caseInsensitive}
            />
        </InlineValueChrome>
    );
};
