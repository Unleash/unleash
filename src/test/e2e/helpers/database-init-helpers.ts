const isSnakeCase = (input: string) => {
    const snakeCaseRegex = /^[a-z]+(_[a-z]+)*$/;
    return snakeCaseRegex.test(input);
};

export const isNotSnakeCase = (input: string) => {
    return !isSnakeCase(input);
};
