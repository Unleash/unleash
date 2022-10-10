export interface IPat {
    id: number;
    secret: string;
    description: string;
    userId: number;
    expiresAt?: Date;
    createdAt?: Date;
    seenAt?: Date;
}

export default class Pat implements IPat {
    id: number;

    secret: string;

    description: string;

    userId: number;

    expiresAt: Date;

    seenAt: Date;

    createdAt: Date;

    constructor({
        id,
        userId,
        expiresAt,
        seenAt,
        createdAt,
        secret,
        description,
    }: IPat) {
        this.id = id;
        this.secret = secret;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.seenAt = seenAt;
        this.createdAt = createdAt;
        this.description = description;
    }
}
