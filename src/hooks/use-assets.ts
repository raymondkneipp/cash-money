import { freqToPeriods } from "../utils/constants";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Asset } from "@/db";
import { useScenario } from "./use-scenario";

export function useAssets() {
	const { currentScenario } = useScenario();

	const assets = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.assets.where({ scenarioId: currentScenario.id }).toArray();
	}, [currentScenario?.id]);

	async function add() {
		if (!currentScenario) {
			throw Error("No scenarioId");
		}

		await db.assets.add({
			scenarioId: currentScenario.id,
			name: "New Asset",
			value: 1_000,
			growthRate: 8,
			contribution: 100,
			frequency: "monthly",
		});
	}

	async function drop(id: number) {
		await db.assets.delete(id);
	}

	async function edit(
		i: { id: number } & Partial<Omit<Asset, "id" | "scenarioId">>,
	) {
		const { id, ...rest } = i;
		await db.assets.update(id, rest);
	}

	const totalAssets = assets?.reduce((sum, a) => sum + a.value, 0) ?? 0;

	const totalAnnualContributions =
		assets?.reduce(
			(sum, a) => sum + a.contribution * (freqToPeriods[a.frequency] ?? 0),
			0,
		) ?? 0;

	return { assets, add, drop, edit, totalAnnualContributions, totalAssets };
}
