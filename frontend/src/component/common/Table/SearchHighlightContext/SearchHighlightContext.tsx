import { createContext, useContext } from 'react';

const SearchHighlightContext = createContext('');

export const SearchHighlightProvider = SearchHighlightContext.Provider;

export const useSearchHighlightContext = () =>
    useContext(SearchHighlightContext);
