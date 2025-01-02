import { StringHelper } from "../../../src/shared/helpers"

describe(StringHelper.name, () => {
  it("test rot13 alg", () => {
    const stringInput = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    const rot13 = StringHelper.rot13(stringInput)
    expect(rot13).toBe("NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm")
  })
})
