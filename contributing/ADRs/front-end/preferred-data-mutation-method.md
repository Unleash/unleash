---
title: "ADR: Preferred data mutation method"
---

## Background

Because our product is open-core, we have complexities and needs for our SaaS platform that are not compatible with the needs of our open-source product. We have found a need to standardise how we fetch data from APIs, in order to reduce complexity and simplify the data fetching process.

## Decision

We have decided to standardise data-fetching and error handling by implementing a top level `useAPI` hook that will take care of formatting the
request in the correct way adding the basePath if unleash is hosted on a subpath, wrap with error handlers and return the data in a consistent way.

Example:

```tsx
import { ITagPayload } from 'interfaces/tags';
import useAPI from '../useApi/useApi';

export const useTagTypesApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createTag = async (payload: ITagPayload) => {
        const path = `api/admin/tag-types`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const validateTagName = async (name: string) => {
        const path = `api/admin/tag-types/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };
    const updateTagType = async (tagName: string, payload: ITagPayload) => {
        const path = `api/admin/tag-types/${tagName}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    const deleteTagType = async (tagName: string) => {
        const path = `api/admin/tag-types/${tagName}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        createTag,
        validateTagName,
        updateTagType,
        deleteTagType,
        errors,
        loading,
    };
};
```
