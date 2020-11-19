module.exports = (eleventyConfig) => {
  eleventyConfig.addWatchTarget('./public')

  eleventyConfig.addPassthroughCopy({ './public': '.' })

  return {
    dir: {
      input: 'src',
      data: '.',
    },
  }
}
