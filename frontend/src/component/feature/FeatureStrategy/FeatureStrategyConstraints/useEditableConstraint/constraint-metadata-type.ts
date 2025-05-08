import type { ILegalValue } from 'interfaces/context';

export type ConstraintMetadata =
    | {
          type: 'legal values';
          legalValues: ILegalValue[];
          deletedLegalValues?: Set<string>;
      }
    | { type: 'date' }
    | { type: 'single value'; variant: 'number' | 'semver' }
    | { type: 'multiple values' };
