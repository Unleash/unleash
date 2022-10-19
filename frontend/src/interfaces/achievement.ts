export interface IAchievement {
    id: number;
    achievementId: string;
    title: string;
    description: string;
    rarity: string;
    imageUrl: string;
    unlockedAt: Date;
    seenAt?: Date;
}

export interface IAchievementDefinitions {
    [key: string]: IAchievementDefinition;
}

export interface IAchievementDefinition {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}
