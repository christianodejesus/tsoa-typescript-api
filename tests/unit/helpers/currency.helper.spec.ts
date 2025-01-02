import { CurrencyHelper } from "../../../src/shared/helpers"

const testNumbers = [-10.01, 10.01, 0, 100, -500.5, 1234.56, -789.12, 2000, 5.0]

describe(CurrencyHelper.name, () => {
  testNumbers.forEach((number) => {
    it(`Should convert ${number} to cents`, () => {
      const result = CurrencyHelper.toCents(number)
      expect(result).toBe(Math.round(number * 100))
    })

    it(`Should convert ${number} to toCurrency`, () => {
      const result = CurrencyHelper.toCurrency(Math.round(number * 100))
      expect(result).toBe(number)
    })
  })
})
