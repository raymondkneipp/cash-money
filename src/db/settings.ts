import { db } from ".";
import { createScenario } from "./scenario";

let isInitializing = false;

export async function initSettings() {
	// Prevent multiple simultaneous calls
	if (isInitializing) {
		return;
	}
	
	isInitializing = true;
	
	try {
		const existing = await db.settings.get(1);

		if (!existing) {
			// Try to grab the first scenario
			let scenario = await db.scenarios.orderBy("id").first();

			if (!scenario) {
				scenario = await createScenario({ name: "Default", age: 20 });
			}

			if (!scenario) {
				throw new Error("Failed to create or fetch a scenario");
			}

			// Use put instead of add to avoid constraint errors
			await db.settings.put({
				id: 1,
				currentScenarioId: scenario.id,
			});
		}
	} finally {
		isInitializing = false;
	}
}
