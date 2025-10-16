export const formatCurrency = (value: number, currency?: string) => {
    if (currency && currency.toLocaleLowerCase() === 'usd') {
        return `$${value.toLocaleString('en-US')}`;
    }
    if (currency && currency.toLocaleLowerCase() === 'eur') {
        return `€\u2009${value.toLocaleString('no-NO')}`;
    }

    return `${value}${currency ? ' ' : ''}${currency || ''}`;
};
