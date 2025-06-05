// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'
// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//   ],
// })

import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react(),tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // or .ts for TypeScript
  },
  ssr: {
    external: [
      "firebase",
      "@firebase/app",
      "@firebase/auth",
      "@firebase/firestore"
    ]
  }
  // server: { // Removing server.deps.inline for this attempt
  //   deps: {
  //     inline: [
  //       "firebase",
  //       "@firebase/app",
  //       "@firebase/auth",
  //       "@firebase/firestore",
  //     ]
  //   }
  // }
})
