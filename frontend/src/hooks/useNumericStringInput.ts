import {
    useState,
    useEffect,
    type ChangeEvent,
    type KeyboardEvent,
} from 'react';

type ParseMode = 'integer' | 'float';

interface UseNumericStringInputOptions {
    parseMode?: ParseMode;
    onEditStart?: () => void;
}

interface UseNumericStringInputReturn {
    inputValue: string;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleInputBlur: () => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    handleFocus: () => void;
}

export const useNumericStringInput = (
    value: number,
    onChange: (value: number) => void,
    options?: UseNumericStringInputOptions,
): UseNumericStringInputReturn => {
    const { parseMode = 'float', onEditStart } = options ?? {};

    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onEditStart?.();
    };

    const handleInputBlur = () => {
        if (inputValue === '') {
            setInputValue(value.toString());
            return;
        }

        const numValue =
            parseMode === 'integer'
                ? Number.parseInt(inputValue, 10)
                : Number.parseFloat(inputValue);

        if (!Number.isNaN(numValue)) {
            onChange(numValue);
        } else {
            setInputValue(value.toString());
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    const handleFocus = () => {
        onEditStart?.();
    };

    return {
        inputValue,
        handleInputChange,
        handleInputBlur,
        handleKeyDown,
        handleFocus,
    };
};
