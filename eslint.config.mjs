import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    globalIgnores([".history/**/*"]),
    {
    extends: compat.extends("eslint:recommended"),
    plugins: {},
    files: ["./src/**/*.js"],

    languageOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        globals: {
            ...globals.browser,
            ...globals.node,
            hexoBilibiliBangumiOptions: true,
            axios: true,
            hexo: true,
        },
    },

    rules: {
        indent: ["error", 2, {
            SwitchCase: 1,
        }],

        "linebreak-style": ["error", "windows"],
        quotes: ["error", "single"],
        semi: ["error", "always"],

        "prefer-const": ["error", {
            destructuring: "any",
            ignoreReadBeforeAssign: false,
        }],

        "no-var": "error",
        "no-new-object": "error",
        "object-shorthand": "error",
        "quote-props": ["error", "as-needed"],
        "prefer-object-spread": "error",
        "no-array-constructor": "error",
        "array-callback-return": "error",

        "prefer-destructuring": ["error", {
            array: true,
            object: true,
        }],

        "prefer-template": "error",
        "template-curly-spacing": ["error", "never"],
        "no-eval": "error",
        "func-style": "off",
        "wrap-iife": ["error", "outside"],
        "no-loop-func": "error",
        "prefer-rest-params": "error",
        "default-param-last": "error",
        "no-new-func": "error",

        "space-before-function-paren": ["error", {
            anonymous: "always",
            named: "never",
            asyncArrow: "always",
        }],

        "space-before-blocks": "error",
        "no-param-reassign": "off",
        "prefer-spread": "error",
        "prefer-arrow-callback": "error",
        "arrow-spacing": "error",
        "arrow-parens": "error",
        "arrow-body-style": "error",

        "no-confusing-arrow": ["error", {
            allowParens: true,
        }],

        "implicit-arrow-linebreak": ["error", "beside"],
        "no-useless-constructor": "error",
        "class-methods-use-this": 0,
        "no-duplicate-imports": "error",

        "object-curly-newline": ["error", {
            ObjectPattern: {
                multiline: true,
            },
        }],

        "no-iterator": "error",
        "generator-star-spacing": ["error", "after"],
        "dot-notation": "error",
        "one-var": ["error", "never"],
        "no-multi-assign": "error",
        "no-plusplus": "off",

        "operator-linebreak": ["error", "after", {
            overrides: {
                "?": "before",
                ":": "before",
            },
        }],

        eqeqeq: "error",
        "no-nested-ternary": "error",
        "no-unneeded-ternary": "error",
        "no-mixed-operators": "error",
        "nonblock-statement-body-position": ["error", "beside"],

        "brace-style": ["error", "1tbs", {
            allowSingleLine: true,
        }],

        "no-else-return": "error",
        "spaced-comment": ["error", "always"],
        "keyword-spacing": "error",
        "space-infix-ops": "error",
        "eol-last": ["error", "always"],

        "newline-per-chained-call": [2, {
            ignoreChainWithDepth: 3,
        }],

        "no-whitespace-before-property": "error",
        "padded-blocks": ["error", "never"],

        "no-multiple-empty-lines": ["error", {
            max: 1,
        }],

        "space-in-parens": ["error", "never"],
        "array-bracket-spacing": ["error", "never"],
        "object-curly-spacing": ["error", "always"],

        "max-len": "off",

        "block-spacing": "error",

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        "computed-property-spacing": ["error", "never"],
        "func-call-spacing": ["error", "never"],
        "key-spacing": "error",
        "no-trailing-spaces": "error",
        "comma-style": "error",
        "comma-dangle": ["error", "never"],
        "no-new-wrappers": "error",
        radix: "error",
        "id-length": "off",
        "no-underscore-dangle": "error",
    },
}]);
