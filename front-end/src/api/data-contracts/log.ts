import { SQL_OPERATION } from "./enums";

export class Log {
    id: number = null;
    userId: number = null;
    userName: string = null;
    timestamp: DateWrapper = null;
    operation: SQL_OPERATION = null;
}

export class LogWithValues extends Log {
    valueDiff: Object = null;
}
