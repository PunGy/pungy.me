import { defineConfig } from 'astro/config';
import shikTmLanguage from 'tree-sitter-shik/shik.tmLanguage.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
    output: "static",
    server: {
        port: 5050,
    },
    markdown: {
        shikiConfig: {
            langs: [{ ...shikTmLanguage, name: 'shik' }],
        },
    },
});
