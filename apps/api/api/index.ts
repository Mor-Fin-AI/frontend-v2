/**
 * Vercel serverless entry — uses the full Express app.
 * Missing env vars never crash startup; see GET /api/health/config.
 */
import { createApp } from "../app.js";

export default createApp();
