import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: "0.0.0.0",
		port: 5173,
		strictPort: true,
		watch: {
			usePolling: true,
		},
		// Add CORS configuration if needed
		cors: true,
		// Enable HMR
		hmr: {
			overlay: true,
		},
	},
});
