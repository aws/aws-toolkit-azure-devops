module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
    },
    env: {
        node: true,
        jest: true
    },
    plugins: ['@typescript-eslint', 'header', 'no-null'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint'
    ],
    rules: {
        // The ones turned off below are used a lot in tests
        'no-empty': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'no-null/no-null': 'error',
        'header/header': [
            'error',
            'block',
            {
                pattern:
                    'Copyright ([0-9]{4}[-,]{0,1}[ ]{0,1}){1,} Amazon.com, Inc. or its affiliates. All Rights Reserved.\\r?\\n \\* SPDX-License-Identifier: MIT'
            },
            { lineEndings: 'unix' }
        ]
    }
}
