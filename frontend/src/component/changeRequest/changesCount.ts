import type { ChangeRequestType } from './changeRequest.types';

export const changesCount = (changeRequest: ChangeRequestType) =>
    changeRequest.features.flatMap((feature) => feature.changes).length +
    changeRequest.segments.length;
