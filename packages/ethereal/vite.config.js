import { defineConfig } from 'vite';
// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        conditions: ['source'],
        mainFields: ['module', 'main']
    },
    build: {
        lib: {
            entry: './ethereal.ts',
            name: 'Ethereal'
        },
        sourcemap: true,
        rollupOptions: {
            external: ['three'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    three: 'THREE'
                }
            }
        }
    }
});
