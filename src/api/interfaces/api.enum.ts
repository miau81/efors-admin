export enum ErrorCode {
    UNAUTHORIZE = "UNAUTHORIZE",
    NO_DATA_FOUND = "NOT_DATA_FOUND",
    BAD_REQUEST = "BAD_REQUEST",
    SERVER_ERROR = "SEVER_ERROR",
    IS_EXISTS = "IS_EXISTS",
    NOT_FOUND = "NOT_FOUND"
}

export enum OperatorEnum {
    eq = "=",
    neq = "!=",
    gteq = ">=",
    lteq = "<=",
    gt = ">",
    lt = "<",
    like = "LIKE",
    in = "IN",
    notin = "NOT IN",
    between = "BETWEEN"
}

export enum FilterType {
    text = "text",
    date = "date",
    datetime = "datetime",
    month = "month",
    year = "year"
}

export enum OrderBy {
    ASC = "ASC",
    DESC = "DESC"
}


export enum ApiRequestMethod {
    GET_ONE = "GET_ONE",
    GET_LIST = "GET_LIST",
    CHECK_EXISTS = "CHECK_EXISTS",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE"

}

export enum AuthURL {
    ADMIN = "admin",
    MERCHANT = "merchant",
    AUTH = "auth",
    PUBLIC = "public"
}