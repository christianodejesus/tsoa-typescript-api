import { DateTimeHelper } from "../../src/shared/helpers"

describe(DateTimeHelper.name, () => {
  it(`Should formatToDate format date correctly from BR to ISO formats`, () => {
    expect(DateTimeHelper.formatToDate("31/01/2001")).toBe("2001-01-31")
  })

  it(`Should formatToDate format date correctly from complete ISO to only date ISO formats`, () => {
    expect(DateTimeHelper.formatToDate("2001-12-31T23:01:55.985Z")).toBe("2001-12-31")
  })

  it(`Should formatToDateTime format date correctly from BR datetime to complete ISO formats`, () => {
    expect(DateTimeHelper.formatToDateTime("31/12/2001")).toBe("2001-12-31T00:00:00.000Z")
  })

  it(`Should formatToDateBR format date correctly from ISO to BR formats`, () => {
    expect(DateTimeHelper.formatToDateBR("2001-12-31")).toBe("31/12/2001")
  })
})
