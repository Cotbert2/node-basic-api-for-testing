
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
            eqeqeq: 'error'
        }
    }
];