import pkg from "@prisma/client";

const { RecordType, Role, UserStatus } = pkg;

export const ROLES = Role;
export const RECORD_TYPES = RecordType;
export const USER_STATUS = UserStatus;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
