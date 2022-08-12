import EventEmitter from 'events';

export const ANY_EVENT = '*';

// Extends the built-in EventEmitter with support for listening for any event.
// See https://stackoverflow.com/a/54431931.
export class AnyEventEmitter extends EventEmitter {
    emit(type: string, ...args: any[]): boolean {
        super.emit(ANY_EVENT, ...args);
        return super.emit(type, ...args) || super.emit('', ...args);
    }
}
