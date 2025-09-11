import { useMemo } from 'react';
import { createPaginatedHook } from '../usePaginatedData/usePaginatedData.js';
import { mockChangeRequests } from './mockChangeRequests.js';

// Type for change request data based on schema
export interface ChangeRequestItem {
    id: number;
    title: string;
    environment: string;
    project: string;
    projectName?: string; // Not in schema but used by GlobalChangeRequestTitleCell
    createdBy: {
        id: number;
        username?: string | null;
        imageUrl?: string | null;
    };
    createdAt: string;
    features: string[];
    segments: string[];
    state: 'Draft' | 'Approved' | 'In review' | 'Applied' | 'Scheduled' | 'Rejected' | 'Cancelled';
    schedule?: {
        scheduledAt: string;
        status: 'Pending' | 'Failed' | 'Suspended';
        reason?: string;
    };
}

export interface ChangeRequestsResponse {
    changeRequests: ChangeRequestItem[];
    total: number;
}


// Sort function that mimics server-side sorting
const sortData = (data: ChangeRequestItem[], sortBy: string, sortOrder: string) => {
    return [...data].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
            case 'environment':
                aValue = a.environment.toLowerCase();
                bValue = b.environment.toLowerCase();
                break;
            case 'state':
                aValue = a.state.toLowerCase();
                bValue = b.state.toLowerCase();
                break;
            case 'createdBy':
                aValue = a.createdBy.username?.toLowerCase() || '';
                bValue = b.createdBy.username?.toLowerCase() || '';
                break;
            default:
                return 0;
        }

        if (aValue < bValue) {
            return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
    });
};

// Pagination function
const paginateData = (data: ChangeRequestItem[], offset: number, limit: number) => {
    return data.slice(offset, offset + limit);
};

// Create the hook using the established pattern but with custom mock logic
export const useChangeRequests = createPaginatedHook<ChangeRequestsResponse>(
    { changeRequests: [], total: 0 },
    '', // No API endpoint - we'll override the fetcher
);

// Override the created hook to add custom mock data logic
const originalUseChangeRequests = useChangeRequests;
export const useChangeRequestsWithMockData = (
    params: Record<string, any> = {},
    dynamicPrefixKey: string = '',
    options: any = {},
) => {
    // Extract parameters with defaults
    const offset = Number(params?.offset) || 0;
    const limit = Number(params?.limit) || 25;
    const sortBy = params?.sortBy || 'createdAt';
    const sortOrder = params?.sortOrder || 'desc';

    const mockData = useMemo(() => {
        // Apply sorting (simulating server-side sorting)
        const sortedData = sortData(mockChangeRequests, sortBy, sortOrder);
        
        // Apply pagination (simulating server-side pagination)
        const paginatedData = paginateData(sortedData, offset, limit);
        
        return {
            changeRequests: paginatedData,
            total: mockChangeRequests.length,
        };
    }, [offset, limit, sortBy, sortOrder]);

    // Simulate loading and return mock data
    return {
        ...mockData,
        loading: false,
        initialLoad: false,
        error: null,
    };
};

// For now, use the mock version. Later, replace with the real API version
export { useChangeRequestsWithMockData as useChangeRequestsSearch };