import { IConstraint } from './strategy';

export interface ISegment {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    createdBy: string;
    constraints: IConstraint[];
}

export interface ISegmentPayload {
    name: string;
    description: string;
    constraints: IConstraint[];
}
