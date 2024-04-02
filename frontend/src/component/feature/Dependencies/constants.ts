export type ParentValue =
    | { status: 'enabled' }
    | { status: 'disabled' }
    | {
          status: 'enabled_with_variants';
          variants: string[];
      };

export const REMOVE_DEPENDENCY_OPTION = {
    key: 'none (remove dependency)',
    label: 'none (remove dependency)',
};
