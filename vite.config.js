import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const certPath = fileURLToPath(new URL("./.certs/dev-https.pfx", import.meta.url))
const certPassphrase = "habit-tracker-pro-dev"

const loadHttpsOptions = () => {
  if (!fs.existsSync(certPath)) {
    return undefined
  }

  return {
    pfx: fs.readFileSync(certPath),
    passphrase: certPassphrase
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  preview: {
    host: true
  }
})
