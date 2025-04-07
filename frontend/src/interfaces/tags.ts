export interface ITag {
    value: string;
    type: string;
    color?: string;
}

export interface ITagType {
    name: string;
    description: string;
    icon: string;
    color?: string;
}

export interface ITagPayload {
    name: string;
    description: string;
    color?: string;
}
