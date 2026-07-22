/**
 * Vercel entry — Express app only (no listen).
 * Bundled to api/index.js (CommonJS) so Vercel never serves .ts as a download.
 */
import { createApp } from "./app.js";

export default createApp();
