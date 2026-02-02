import type { Config } from "next"

const config: Config = {
  plugins: [require("next-intl/plugin")("./i18n.ts")],
}

export default config
