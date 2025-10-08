export const formatCurrency = (value: number, currency?: string) => {
    if (currency === 'USD') {
        return `$${value.toLocaleString('en-US')}`;
    }
    if (currency === 'EUR') {
        return `€\u2009${value.toLocaleString('no-NO')}`;
    }

    return `${value}${currency ? ' ' : ''}${currency || ''}`;
};
