import { backdropClasses } from '@mui/material/Backdrop';

const VISIBLE_DIALOG_BACKDROP_SELECTOR = `.${backdropClasses.root}:not(.${backdropClasses.invisible})`;

export const isHiddenByVisibleDialog = (
    element: Element | null | undefined,
): boolean => {
    if (!document.querySelector(VISIBLE_DIALOG_BACKDROP_SELECTOR)) {
        return false;
    }
    return !element || element.closest('[aria-hidden="true"]') !== null;
};
