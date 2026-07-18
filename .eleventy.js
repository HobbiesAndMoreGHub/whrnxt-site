module.exports = function (eleventyConfig) {
  // Copy the CSS (and any future images) straight through to the built site.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Icons belong at the site root — iOS probes /apple-touch-icon.png directly,
  // so they can't live under /assets. Copies of the app's own icons.
  eleventyConfig.addPassthroughCopy({ "src/icons": "." });

  // Decap CMS admin — copy verbatim, don't run it through the template engine.
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/index.html");

  // Human-readable date filter for articles.
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    })
  );

  // W3C date (YYYY-MM-DD) for sitemap <lastmod>.
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

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
