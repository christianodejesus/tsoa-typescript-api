import { StringHelper } from "./string.helper"

export abstract class CurrencyHelper {
  public static toCents(value: number, decimals = 2): number {
    try {
      const centsValue = Number(value).toFixed(decimals).toString().replace(".", "")
      return Number(centsValue)
    } catch {
      throw new Error("invalid.value")
    }
  }

  public static toCurrency(value: number, decimals = 2): number {
    try {
      const centsValue = value.toString().replace(".", "")
      const divisor = Number(String("1").padEnd(decimals + 1, "0"))
      const formatted = Number(centsValue) / divisor
      return formatted
    } catch {
      throw new Error("invalid.value")
    }
  }

  public static formatToOutput(value: number, decimals = 2): string {
    try {
      const centsValue = StringHelper.removeNonNumericCharacters(value.toString())
      const divisor = Number(String("1").padEnd(decimals + 1, "0"))
      const formatted = (Number(centsValue) / divisor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      return formatted
    } catch {
      throw new Error("invalid.value")
    }
  }
}
