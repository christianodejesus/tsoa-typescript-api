import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import utc from "dayjs/plugin/utc"

dayjs.extend(customParseFormat)
dayjs.extend(utc)

export abstract class DateTimeHelper {
  private static formats = [
    "YYYY-MM-DD",
    "YYYY-MM-DDTHH:mm:ss.SSSZ",
    "DD-MM-YYYY",
    "DD/MM/YYYY",
    "DD/MM/YYYYTHH:mm:ss",
    "DD/MM/YY",
    "MM/DD/YYYY",
  ]

  private static parseDate(date: string) {
    return dayjs(date, DateTimeHelper.formats)
  }

  public static getCurrentDateTime(precision: "ss" | "ms" = "ms"): string {
    return dayjs().format(`YYYY-MM-DDTHH:mm:ss${precision === "ms" ? ".SSS" : ""}[Z]`)
  }

  public static formatToDateTime(date: string, precision: "ss" | "ms" = "ms"): string {
    return DateTimeHelper.parseDate(date).format(`YYYY-MM-DDTHH:mm:ss${precision === "ms" ? ".SSS" : ""}[Z]`)
  }

  public static formatToDate(date: string): string {
    return DateTimeHelper.parseDate(date).format("YYYY-MM-DD")
  }

  public static formatToDateBR(date: string): string {
    return DateTimeHelper.parseDate(date).format("DD/MM/YYYY")
  }

  public static checkIfIsISOString(date: string): boolean {
    const regexISOString = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})\.[0-9]{3}Z$/
    return regexISOString.test(date)
  }

  public static checkIfIsISOOnlyDate(date: string): boolean {
    const regexISOString = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/
    return regexISOString.test(date)
  }

  public static getDaysInMilliseconds(days: number): number {
    return DateTimeHelper.getDaysInSeconds(days) * 1000
  }

  public static getDaysInSeconds(days: number): number {
    return days * 24 * 60 * 60
  }

  public static ageDateByDays(date: string, days: number) {
    return DateTimeHelper.parseDate(date).subtract(days, "days").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
  }

  public static getDateMilisenconds(date: string) {
    return DateTimeHelper.parseDate(date).valueOf()
  }
}
