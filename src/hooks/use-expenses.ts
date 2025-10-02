import { freqToPeriods } from "../utils/constants";
import type { Expense } from "../utils/types";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useScenario } from "./use-scenario";

export function useExpenses() {
	const { currentScenario } = useScenario();

	const expenses = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.expenses
			.where({ scenarioId: currentScenario.id })
			.toArray();
	}, [currentScenario?.id]);

	async function add() {
		if (!currentScenario) {
			throw Error("No scenarioId");
		}

		await db.expenses.add({
			name: "New expense",
			amount: 200,
			frequency: "monthly",
			scenarioId: currentScenario.id,
		});
	}

	async function drop(id: number) {
		await db.expenses.delete(id);
	}

	async function edit(
		i: { id: number } & Partial<Omit<Expense, "id" | "scenarioId">>,
	) {
		const { id, ...rest } = i;
		await db.expenses.update(id, rest);
	}

	const totalAnnualExpense =
		expenses?.reduce((sum, expense) => {
			const periods = freqToPeriods[expense.frequency] ?? 1;
			return sum + expense.amount * periods;
		}, 0) ?? 0;

	return { expenses, add, drop, edit, totalAnnualExpense };
}
