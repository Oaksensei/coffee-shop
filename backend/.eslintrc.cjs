module.exports = {
  root: true,
  env: { node: true, es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: "script" },
  plugins: ["import"],
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  rules: {
    "import/order": ["warn", { "newlines-between": "always" }],
  },
  ignorePatterns: ["node_modules/", "dist/"],
};
