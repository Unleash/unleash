import { IChangeRequest } from './changeRequest.types';

export const changesCount = (changeRequest: IChangeRequest) =>
    changeRequest.features.flatMap(feature => feature.changes).length;
