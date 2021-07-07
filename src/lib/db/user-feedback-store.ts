import { Knex } from 'knex';
import { EventEmitter } from 'events';
import { LogProvider, Logger } from '../logger';

const COLUMNS = ['given', 'user_id', 'feedback_id', 'nevershow'];
const TABLE = 'user_feedback';

interface IUserFeedbackTable {
    nevershow?: boolean;
    feedback_id: string;
    given?: Date;
    user_id: number;
}

export interface IUserFeedback {
    neverShow: boolean;
    feedbackId: string;
    given?: Date;
    userId: number;
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

export default class UserFeedbackStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-feedback-store.js');
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
}

module.exports = UserFeedbackStore;
