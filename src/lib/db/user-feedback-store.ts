import { Knex } from 'knex';
import { EventEmitter } from 'events';
import { LogProvider, Logger } from '../logger';
import {
    IUserFeedback,
    IUserFeedbackKey,
    IUserFeedbackStore,
} from '../types/stores/user-feedback-store';

const COLUMNS = ['given', 'user_id', 'feedback_id', 'nevershow'];
const TABLE = 'user_feedback';

interface IUserFeedbackTable {
    nevershow?: boolean;
    feedback_id: string;
    given?: Date;
    user_id: number;
}

const fieldToRow = (fields: IUserFeedback): IUserFeedbackTable => ({
    nevershow: fields.neverShow,
    feedback_id: fields.feedbackId,
    given: fields.given,
    user_id: fields.userId,
});

const rowToField = (row: IUserFeedbackTable): IUserFeedback => ({
    neverShow: row.nevershow,
    feedbackId: row.feedback_id,
    given: row.given,
    userId: row.user_id,
});

export default class UserFeedbackStore implements IUserFeedbackStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-feedback-store.ts');
    }

    async getAllUserFeedback(userId: number): Promise<IUserFeedback[]> {
        const userFeedback = await this.db
            .table<IUserFeedbackTable>(TABLE)
            .select()
            .where({ user_id: userId });

        return userFeedback.map(rowToField);
    }

    async getFeedback(
        userId: number,
        feedbackId: string,
    ): Promise<IUserFeedback> {
        const userFeedback = await this.db
            .table<IUserFeedbackTable>(TABLE)
            .select()
            .where({ user_id: userId, feedback_id: feedbackId })
            .first();

        return rowToField(userFeedback);
    }

    async updateFeedback(feedback: IUserFeedback): Promise<IUserFeedback> {
        const insertedFeedback = await this.db
            .table<IUserFeedbackTable>(TABLE)
            .insert(fieldToRow(feedback))
            .onConflict(['user_id', 'feedback_id'])
            .merge()
            .returning(COLUMNS);

        return rowToField(insertedFeedback[0]);
    }

    async delete({ userId, feedbackId }: IUserFeedbackKey): Promise<void> {
        await this.db(TABLE)
            .where({ user_id: userId, feedback_id: feedbackId })
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists({ userId, feedbackId }: IUserFeedbackKey): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE user_id = ? AND feedback_id = ?) AS present`,
            [userId, feedbackId],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get({
        userId,
        feedbackId,
    }: IUserFeedbackKey): Promise<IUserFeedback> {
        return this.getFeedback(userId, feedbackId);
    }

    async getAll(): Promise<IUserFeedback[]> {
        const userFeedbacks = await this.db
            .table<IUserFeedbackTable>(TABLE)
            .select();

        return userFeedbacks.map(rowToField);
    }
}

module.exports = UserFeedbackStore;
