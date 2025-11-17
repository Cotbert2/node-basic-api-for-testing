
import js from '@eslint/js';
import globals from 'globals';
export default [
    {
        files: ['src/**/*.js'], 
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: { 
                ...globals.node 
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            'capitalized-comments': ['error'],
            'no-unused-vars': 'error',
            'no-console': ['warn', { 'allow': ['error', 'warn'] }],
            'prefer-const': 'error',
            eqeqeq: 'error',
            'no-var': 'error',                          // Enforce let/const over var
            'object-shorthand': 'error',                // Require object shorthand syntax
            'prefer-arrow-callback': 'error',           // Prefer arrow functions as callbacks
            'no-duplicate-imports': 'error',            // Disallow duplicate module imports
            'no-trailing-spaces': 'error'               // Disallow trailing whitespace
        }
    }
];