export interface IAchievement {
    id: number;
    title: string;
    description: string;
    rarity: string;
    imageUrl: string;
    unlockedAt: Date;
    seenAt?: Date;
}

export interface IAchievementResult {
    id: number;
    achievementId: string;
    rarity: string;
    unlockedAt: Date;
    seenAt?: Date;
}
