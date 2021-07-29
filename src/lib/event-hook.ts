import EventEmitter from 'events';
import { EventHook } from './types/option';
import {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} from './types/events';

export const addEventHook = (
    eventHook: EventHook,
    eventStore: EventEmitter,
): void => {
    eventStore.on(FEATURE_CREATED, (data) => {
        eventHook(FEATURE_CREATED, data);
    });
    eventStore.on(FEATURE_UPDATED, (data) => {
        eventHook(FEATURE_UPDATED, data);
    });
    eventStore.on(FEATURE_ARCHIVED, (data) => {
        eventHook(FEATURE_ARCHIVED, data);
    });
    eventStore.on(FEATURE_REVIVED, (data) => {
        eventHook(FEATURE_REVIVED, data);
    });
};
