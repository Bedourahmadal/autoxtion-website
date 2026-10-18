import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

// Pages keep the addresses the site already has: /solutions/training-simulation/, /en/consulting/, ...
export default defineConfig({
  site: "https://autoxtion.com",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/badge/"),
      i18n: { defaultLocale: "ar", locales: { ar: "ar-SA", en: "en" } },
    }),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
