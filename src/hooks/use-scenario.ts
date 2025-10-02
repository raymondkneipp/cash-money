import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useScenario() {
	// Watch settings row
	const settings = useLiveQuery(() => db.settings.get(1), []);

	// Watch all scenarios
	const scenarios = useLiveQuery(() => db.scenarios.toArray());

	// Watch current scenario row based on settings
	const currentScenario = useLiveQuery(async () => {
		if (!settings?.currentScenarioId) return undefined;
		return await db.scenarios.get(settings.currentScenarioId);
	}, [settings?.currentScenarioId]);

	async function deleteCurrentScenario() {
		if (!settings?.currentScenarioId || !scenarios) return;

		// Prevent deletion if it's the only scenario
		if (scenarios.length <= 1) {
			throw new Error("Cannot delete the last scenario.");
		}

		// Delete current scenario
		await db.scenarios.delete(settings.currentScenarioId);

		// Pick the next available scenario
		const nextScenario = scenarios.find(
			(s) => s.id !== settings.currentScenarioId,
		);
		if (nextScenario) {
			await db.settings.update(1, { currentScenarioId: nextScenario.id });
		}
	}

	return {
		scenarios,
		settings,
		currentScenario,
		deleteCurrentScenario,
	};
}
