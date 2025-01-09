// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  plugins: [
    { src: "~/plugins/leaflet.client.ts", mode: "client" }, // Muat hanya di client
  ],
  devServer: {
    port: 8090,
  },
  pages: true,
  modules: ["@nuxtjs/leaflet"],
});
