'use strict';

import { Knex } from 'knex';
import { EventEmitter } from 'events';
import { LogProvider, Logger } from '../logger';
import NotFoundError from '../error/notfound-error';

const COLUMNS = ['feedback_id', 'user_id', 'given', 'nevershow'];
const TABLE = 'user_feedback';

interface IUserFeedbackTable {
    nevershow?: boolean;
    feedback_id: string;
    given?: Date;
    user_id: number;
}

export interface IUserFeedback {
    nevershow: boolean;
    feedback_id: string;
    given?: Date;
    user_id: number;
}

export default class UserFeedbackStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-feedback-store.js');
    }

    async getAllUserFeedback(user_id: number): Promise<IUserFeedback[]> {
        const userFeedback = await this.db
            .table<IUserFeedback>(TABLE)
            .select()
            .where({ user_id });

        return userFeedback;
    }

    async getFeedback(
        user_id: number,
        feedback_id: string,
    ): Promise<IUserFeedback> {
        const userFeedback = await this.db
            .table<IUserFeedback>(TABLE)
            .select()
            .where({ user_id, feedback_id })
            .first();

        return userFeedback;
    }

    async updateFeedback(feedback: IUserFeedback): Promise<IUserFeedback> {
        const insertedFeedback = await this.db
            .table<IUserFeedback>(TABLE)
            .insert(feedback)
            .onConflict(['user_id', 'feedback_id'])
            .merge()
            .returning('*')
            .first();

        return insertedFeedback;
    }
}

module.exports = UserFeedbackStore;
