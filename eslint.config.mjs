import rxjs from "eslint-plugin-rxjs-x";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin";
// angular-eslint 22 dropped the eslintrc-style "plugin:@angular-eslint/*" shareable configs, so
// they are pulled from the flat-config entry point instead of through FlatCompat.
import angular from "angular-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "src/framework/**/*",
    ],
}, ...angular.configs.tsRecommended.map(config => ({
    ...config,
    files: ["**/*.ts"],
})), ...compat.extends("eslint-config-prettier").map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],
    processor: angular.processInlineTemplates,

    plugins: {
        rxjs,
        "@typescript-eslint": tseslint,
    },

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: ["tsconfig.json", "e2e/tsconfig.json"],
            createDefaultProgram: true,
        },
    },

    rules: {
        quotes: "off",
        "dot-notation": "off",
        "no-restricted-globals": ["error", "fit", "fdescribe"],
        "@typescript-eslint/dot-notation": "error",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",
        "no-underscore-dangle": "off",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@angular-eslint/prefer-standalone": "off",
        "@angular-eslint/prefer-inject": "off",

        "rxjs/no-unsafe-takeuntil": ["error", {
            allow: [
                "count",
                "defaultIfEmpty",
                "endWith",
                "every",
                "finalize",
                "finally",
                "isEmpty",
                "last",
                "max",
                "min",
                "publish",
                "publishBehavior",
                "publishLast",
                "publishReplay",
                "reduce",
                "share",
                "shareReplay",
                "skipLast",
                "takeLast",
                "throwIfEmpty",
                "toArray",
            ],
        }],
    },
}, ...angular.configs.templateRecommended.map(config => ({
    ...config,
    files: ["**/*.html"],
})), ...compat.extends("eslint-config-prettier").map(config => ({
    ...config,
    files: ["**/*.html"],
})), {
    files: ["**/*.html"],

    rules: {
        // angular-eslint 22 added this to its recommended set. The 162 hits are all in upstream's
        // docs and playground templates, which this fork does not maintain and will not migrate
        // off *ngIf / *ngFor - src/framework is not linted at all (see ignores above).
        "@angular-eslint/template/prefer-control-flow": "off",
    },
}, {
    files: ["./*.js"],

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: 11,
        sourceType: "commonjs",
    },
}];
