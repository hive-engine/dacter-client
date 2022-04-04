module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: ["xo", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-await-in-loop": 0,
    "capitalized-comments": 0,
    complexity: 0,
    camelcase: ["error", { properties: "never" }],
  },
};
