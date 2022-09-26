export interface IPat {
    secret: string;
    description: string;
    userId: number;
    expiresAt?: Date;
    createdAt?: Date;
    seenAt?: Date;
}

export default class Pat implements IPat {
    secret: string;

    description: string;

    userId: number;

    expiresAt: Date;

    seenAt: Date;

    createdAt: Date;

    constructor({
        secret,
        userId,
        expiresAt,
        seenAt,
        createdAt,
        description,
    }: IPat) {
        this.secret = secret;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.seenAt = seenAt;
        this.createdAt = createdAt;
        this.description = description;
    }
}
