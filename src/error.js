/**
 * The custom error thrown by Suri.
 *
 * @memberof module:suri
 * @extends Error
 */
class SuriError extends Error {
  /**
   * Create an error for Suri.
   *
   * @param {string} message The description of what failed.
   * @param {Object} [options]
   * @param {Error} [options.cause] The underlying cause of the error.
   */
  constructor(message, { cause = null } = {}) {
    super(message, { cause })

    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name
  }
}

export default SuriError
