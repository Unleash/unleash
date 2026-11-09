// Create a set of unique error messages and join them with a semicolon
// This will help to avoid duplicate error messages in tracking events
// String helps with search and GROUP BY in flight recorder
export const formatValidationErrors = (
    validationErrors: Record<string, string>,
): string => [...new Set(Object.values(validationErrors))].join('; ');
