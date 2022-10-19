interface IAchievementValue {
    id: number;
    title: string;
    description: string;
    rarity: string;
    imageUrl: string;
    unlockedAt: Date;
    seenAt?: Date;
}

interface IAchievementNull {
    id: -1;
}

export type IAchievement = IAchievementValue | IAchievementNull;
