export type TriggerEvent =
    | { on: 'page'; path: string }
    | { on: 'click'; path: string; target: Element }
    | { on: 'appear'; path: string; added: Element }
    | { on: 'event'; path: string; name: string };
