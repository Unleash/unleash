import { ITag } from './tags';

export interface IEvent {
    id: number;
    createdAt: string;
    type: string;
    createdBy: string;
    project?: string;
    environment?: string;
    featureName?: string;
    data?: any;
    preData?: any;
    tags?: ITag[];
}
