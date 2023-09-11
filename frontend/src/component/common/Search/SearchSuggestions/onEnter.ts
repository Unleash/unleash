export const onEnter = (callback: () => void) => {
    return (event: React.KeyboardEvent<HTMLSpanElement>): void => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            callback();
        }
    };
};
