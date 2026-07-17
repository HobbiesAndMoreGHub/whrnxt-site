module.exports = function (eleventyConfig) {
  // Copy the CSS (and any future images) straight through to the built site.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Human-readable date filter for articles.
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    })
  );

  // Newest-first collection of all articles in src/posts/*.md
  eleventyConfig.addCollection("post", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
