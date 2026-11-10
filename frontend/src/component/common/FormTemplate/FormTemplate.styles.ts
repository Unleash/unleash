const sidebarWidthPercentage = 36;
const formWidthPercentage = 100 - sidebarWidthPercentage;

export const formTemplateSidebarWidth = `${sidebarWidthPercentage}%`;
export const formTemplateFixedSidebarWidth = `420px`;

export const formTemplateFormWidth = `${formWidthPercentage}%`;

// Below this height, unpin a pinned footer to not hide too much content.
export const formTemplatePinnedFooterMediaQuery = '@media (min-height: 38em)';

export const fitContainerHeightSelector = '[data-fit-container-height="true"]';
