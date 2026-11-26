// pluralize(2, 'token') is "2 tokens"; pass the plural when it isn't noun + s
export const pluralize = (count: number, noun: string, plural = `${noun}s`) =>
    `${count} ${count === 1 ? noun : plural}`;
