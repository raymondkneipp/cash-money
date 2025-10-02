import { freqToPeriods } from "../utils/constants";
import type { Income } from "../utils/types";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useScenario } from "./use-scenario";

export function useIncomes() {
	const { currentScenario } = useScenario();

	const incomes = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.incomes.where({ scenarioId: currentScenario.id }).toArray();
	}, [currentScenario?.id]);

	async function add() {
		if (!currentScenario) {
			throw Error("No scenarioId");
		}

		await db.incomes.add({
			name: "New income",
			amount: 1_000,
			frequency: "monthly",
			scenarioId: currentScenario.id,
		});
	}

	async function drop(id: number) {
		await db.incomes.delete(id);
	}

	async function edit(
		i: { id: number } & Partial<Omit<Income, "id" | "scenarioId">>,
	) {
		const { id, ...rest } = i;
		await db.incomes.update(id, rest);
	}

	const totalAnnualIncome =
		incomes?.reduce((sum, income) => {
			const periods = freqToPeriods[income.frequency] ?? 1;
			return sum + income.amount * periods;
		}, 0) ?? 0;

	return { incomes, add, drop, edit, totalAnnualIncome };
}
