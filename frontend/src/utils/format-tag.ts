import type { ITag } from 'interfaces/tags';
import type { TagSchema } from 'openapi';

// Use TagSchema or ITag for backwards compatability in components that
// have not yet been refactored to use TagSchema
export const formatTag = (tag: TagSchema | ITag) => {
    return `${tag.type}:${tag.value}`;
};
