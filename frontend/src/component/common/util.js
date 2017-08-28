const dateTimeOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
};

export const formatFullDateTime = v => new Date(v).toLocaleString('nb-NO', dateTimeOptions);
