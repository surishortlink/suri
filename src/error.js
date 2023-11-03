class SuriError extends Error {
  constructor(message, originalError = null) {
    super(message)

    this.originalError = originalError

    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name
  }
}

export default SuriError
