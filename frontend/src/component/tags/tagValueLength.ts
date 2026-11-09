export const TAG_VALUE_MIN_LENGTH = 2;
export const TAG_VALUE_MAX_LENGTH = 50;

// Count code points like the server does, so an emoji is one character.
export const hasValidTagValueLength = (value: string): boolean => {
    const length = [...value].length;
    return length >= TAG_VALUE_MIN_LENGTH && length <= TAG_VALUE_MAX_LENGTH;
};
