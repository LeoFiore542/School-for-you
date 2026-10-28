import type { NextConfig } from "next";

/**
 * On GitHub Pages project sites the app is served under /<repo-name>.
 * Locally leave basePath empty so `npm run dev` stays on http://localhost:3000.
 */
const repoName = "School-for-you";
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(isGithubPages
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
