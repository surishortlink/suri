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
   * @param {Error} [originalError] The original error that was caught.
   */
  constructor(message, originalError = null) {
    super(message)

    /**
     * The original error that was caught.
     *
     * @member {Error}
     */
    this.originalError = originalError

    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name
  }
}

export default SuriError
