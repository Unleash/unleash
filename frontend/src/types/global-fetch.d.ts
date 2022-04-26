// Add missing GlobalFetch declaration for the OpenAPI bindings.
// https://github.com/apollographql/apollo-link/issues/1131#issuecomment-526109609
declare type GlobalFetch = WindowOrWorkerGlobalScope;
