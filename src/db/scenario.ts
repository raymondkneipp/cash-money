import { db, type Scenario } from ".";

export async function createScenario(scenario: Omit<Scenario, "id">) {
	const id = await db.scenarios.add(scenario);
	const full = await db.scenarios.get(id);

	if (!full) {
		throw new Error("Failed to create scenario");
	}

	return full;
}

export async function editScenario(scenario: Scenario) {
	const { id, ...rest } = scenario;

	try {
		const updatedScenario = await db.scenarios.update(id, rest);
		if (updatedScenario) {
			console.log("Updated scenario");
		} else {
			console.error(`No scenario with ${id} found.`);
		}
	} catch (err) {
		console.error("Failed to update scenario.");
	}
}
