export abstract class StringHelper {
  static validateJsonString(jsonStr: string) {
    try {
      JSON.parse(jsonStr)
      return true
    } catch {
      return false
    }
  }

  static hasInvalidCharacters(input: string): boolean {
    // e.g. emojis, non-standard spaces, copyright, chinese characters, and other non-standard miscelania
    // regex source: https://www.regextester.com/106421
    return /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/.test(input)
  }

  static sanitizeName(name?: string) {
    return name?.trim()?.replace(/(\s)+/g, " ")
  }

  static removeNonNumericCharacters(docNumber?: string) {
    return docNumber?.replace(/[^\d]/g, "")
  }

  static hasDigits(name: string) {
    return /\d/.test(name)
  }

  static hasNoDigits(value: string) {
    return /[^0-9]/.test(value)
  }

  static rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, (char: string) => {
      const code = char.charCodeAt(0),
        firstCode = code <= "Z".charCodeAt(0) ? "A".charCodeAt(0) : "a".charCodeAt(0)
      return String.fromCharCode(firstCode + ((code - firstCode + 13) % 26))
    })
  }
}
