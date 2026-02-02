import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(config);
