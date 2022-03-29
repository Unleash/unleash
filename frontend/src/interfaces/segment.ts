import { IConstraint } from './strategy';

export interface ISegment {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    createdBy: string;
    constraints: IConstraint[];
}

export type ISegmentPayload = Pick<
    ISegment,
    'name' | 'description' | 'constraints'
>;
