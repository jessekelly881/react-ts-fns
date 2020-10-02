const dayjs = require("dayjs");

export type DatePart =
    | "year"
    | "month"
    | "date"
    | "hour"
    | "minute"
    | "second"
    | "millisecond";

const dayParts: DatePart[] = ["year", "month", "date"];
const timeParts: DatePart[] = ["hour", "minute", "second", "millisecond"];

/**
 * mergeDatesByPart :: DatePart -> (Date, Date) -> Date
 */
export const mergeDatesByPart = (part: DatePart) => (x: Date, y: Date): Date =>
    dayjs(x).set(part, dayjs(y).get(part));

/**
 * mergeDatesByParts :: DatePart[] -> (Date, Date) -> Date
 */
const mergeDatesByParts = (parts: DatePart[]) => (x: Date, y: Date): Date => {
    var d = x;
    parts.forEach((p: DatePart) => mergeDatesByPart(p)(d, y));
    return d;
};

export const mergeDays = mergeDatesByParts(dayParts);
export const mergeTimes = mergeDatesByParts(timeParts);
