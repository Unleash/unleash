import type { ILegalValue } from 'interfaces/context';
export type SingleValueConstraintMetadata = {
    type: 'single value';
    variant: 'number' | 'semver' | 'date';
};
export type MultiValueConstraintMetadata =
    | {
          type: 'legal values';
          legalValues: ILegalValue[];
          deletedLegalValues?: Set<string>;
      }
    | { type: 'multiple values' };

export type ConstraintMetadata =
    | SingleValueConstraintMetadata
    | MultiValueConstraintMetadata;
