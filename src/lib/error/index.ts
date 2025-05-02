import BadDataError from './bad-data-error.js';
import {
    UNIQUE_CONSTRAINT_VIOLATION,
    FOREIGN_KEY_VIOLATION,
} from './db-error.js';
import DisabledError from './disabled-error.js';
import FeatureHasTagError from './feature-has-tag-error.js';
import IncompatibleProjectError from './incompatible-project-error.js';
import InvalidOperationError from './invalid-operation-error.js';
import InvalidTokenError from './invalid-token-error.js';
import NameExistsError from './name-exists-error.js';
import PermissionError from './permission-error.js';
import { OperationDeniedError } from './operation-denied-error.js';
import UserTokenError from './used-token-error.js';
import RoleInUseError from './role-in-use-error.js';
import PasswordUndefinedError from './password-undefined.js';
import PasswordMismatchError from './password-mismatch.js';
import PatternError from './pattern-error.js';
import ForbiddenError from './forbidden-error.js';
import NotFoundError from './notfound-error.js';
import {
    ExceedsLimitError,
    throwExceedsLimitError,
} from './exceeds-limit-error.js';
import { GenericUnleashError } from './unleash-error.js';
import NotImplementedError from './not-implemented-error.js';
export {
    BadDataError,
    UNIQUE_CONSTRAINT_VIOLATION,
    FOREIGN_KEY_VIOLATION,
    NotFoundError,
    DisabledError,
    FeatureHasTagError,
    IncompatibleProjectError,
    InvalidOperationError,
    InvalidTokenError,
    NameExistsError,
    NotImplementedError,
    PermissionError,
    ForbiddenError,
    OperationDeniedError,
    UserTokenError,
    RoleInUseError,
    PasswordUndefinedError,
    PatternError,
    PasswordMismatchError,
    throwExceedsLimitError,
    GenericUnleashError,
    ExceedsLimitError,
};
