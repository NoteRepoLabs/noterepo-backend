import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Ensure to call this before importing any other modules!
Sentry.init({
	dsn: "https://f2a3f10057a57834e4283d643b416ee7@o4507763422658560.ingest.us.sentry.io/4507771200012288",
	integrations: [
		// Add our Profiling integration
		nodeProfilingIntegration(),
	],

	tracesSampleRate: 1.0,

	// Set sampling rate for profiling
	// This is relative to tracesSampleRate
	profilesSampleRate: 1.0,
});
