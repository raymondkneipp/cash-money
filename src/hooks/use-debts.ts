import { freqToPeriods } from "../utils/constants";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Debt } from "@/db";
import { useScenario } from "./use-scenario";
import { useIncomes } from "./use-incomes";

export function useDebts() {
	const { currentScenario } = useScenario();
	const { totalAnnualIncome } = useIncomes();

	const debts = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.debts.where({ scenarioId: currentScenario.id }).toArray();
	}, [currentScenario?.id]);

	async function add() {
		if (!currentScenario) {
			throw Error("No scenarioId");
		}

		await db.debts.add({
			scenarioId: currentScenario.id,
			name: "New Debt",
			principal: 1_000,
			interestRate: 15,
			minimumPayment: 30,
			frequency: "monthly",
		});
	}

	async function drop(id: number) {
		await db.debts.delete(id);
	}

	async function edit(
		i: { id: number } & Partial<Omit<Debt, "id" | "scenarioId">>,
	) {
		const { id, ...rest } = i;
		await db.debts.update(id, rest);
	}

	const totalOutstanding = debts?.reduce((sum, d) => sum + d.principal, 0) ?? 0;

	const totalAnnualDebtPayments =
		debts?.reduce((sum, d) => {
			const periods = freqToPeriods[d.frequency];
			return sum + d.minimumPayment * periods;
		}, 0) ?? 0;

	const monthlyIncome = totalAnnualIncome / 12;
	const monthlyDebtPayments = totalAnnualDebtPayments / 12;

	const dtiRatio =
		monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

	const averageInterestRate =
		debts && debts.length > 0
			? debts.reduce((sum, d) => sum + d.interestRate, 0) / debts.length
			: 0;

	return {
		debts,
		add,
		drop,
		edit,
		totalOutstanding,
		totalAnnualDebtPayments,
		dtiRatio,
		averageInterestRate,
	};
}
