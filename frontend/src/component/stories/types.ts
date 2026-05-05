import type { FC } from 'react';

export type BgKey =
    | 'paper'
    | 'elevation1'
    | 'elevation2'
    | 'application'
    | 'sidebar';

export interface StoryMeta {
    title: string;
    background?: BgKey;
}

export type Story = FC;
