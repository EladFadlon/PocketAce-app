import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    // Remove padding so icons are full-bleed (no white outline on iOS)
    apple: { sizes: [180], padding: 0 },
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[64, 'favicon.ico']],
      padding: 0,
    },
  },
  images: ['public/favicon.svg'],
})
