export type WeekData = {
    newProductionFlags?: number;
    week: string;
    date: string;
};

export type BatchedWeekData = WeekData & {
    endDate: string;
};
