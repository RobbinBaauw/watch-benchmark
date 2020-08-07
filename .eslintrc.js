module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "plugin:vue/vue3-recommended",
        "eslint:recommended",
        "@vue/typescript/recommended",
        "@vue/prettier",
        "@robbinbaauw",
    ],
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: 2020,
    },
};
