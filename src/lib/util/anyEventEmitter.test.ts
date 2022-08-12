import { AnyEventEmitter } from './anyEventEmitter';

test('AnyEventEmitter', () => {
    const events = [];
    const results = [];

    class MyEventEmitter extends AnyEventEmitter {}
    const myEventEmitter = new MyEventEmitter();

    myEventEmitter.on('a', () => events.push('a'));
    myEventEmitter.on('b', () => events.push('b'));
    myEventEmitter.on('c', () => events.push('c'));
    myEventEmitter.on('*', () => events.push('*'));

    results.push(myEventEmitter.emit('a'));
    results.push(myEventEmitter.emit('b'));
    results.push(myEventEmitter.emit('c'));
    results.push(myEventEmitter.emit('d'));

    expect(events).toEqual(['*', 'a', '*', 'b', '*', 'c', '*']);
    expect(results).toEqual([true, true, true, false]);
});
