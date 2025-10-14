export type WeekData = {
    newProductionFlags?: number;
    week: string;
    date: string;
};

export type BatchedWeekData = Omit<WeekData, 'week'> & {
    endDate: string;
};
