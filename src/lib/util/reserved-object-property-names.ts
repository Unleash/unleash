// These names collide with inherited properties when used as plain-object keys.
export const reservedObjectPropertyNames = [
    '__proto__',
    'constructor',
    'prototype',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf',
];
