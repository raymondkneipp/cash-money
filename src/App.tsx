import { useEffect, useState } from "react";
import type { Expense, Income, InterestBearing } from "@/utils/types";
import {
	calculateDebtToIncomeRatio,
	calculateTotalPrinciple,
	calculateTotalAnnual,
	calculateTotalAnnualPayments,
	formatCurrency,
} from "@/utils/fn";
import { Incomes } from "@/components/incomes";
import { Expenses } from "@/components/expenses";
import { Debts } from "@/components/debts";
import { Assets } from "@/components/assets";
import { Header } from "./components/header";
import { initSettings } from "./db/settings";

function App() {
	const [incomes, setIncomes] = useState<Income[]>([
		{
			id: 1,
			name: "Job",
			amount: 35_000,
			frequency: "annually",
		},
	]);

	const [expenses, setExpenses] = useState<Expense[]>([
		{
			id: 1,
			name: "Groceries",
			amount: 150,
			frequency: "biweekly",
		},
	]);

	const [debts, setDebts] = useState<InterestBearing[]>([
		{
			id: 1,
			name: "Car",
			principal: 12_000,
			rate: 0.06,
			compound: "monthly",
			contribution: 360,
			contributionFrequency: "monthly",
		},
	]);

	const [assets, setAssets] = useState<InterestBearing[]>([
		{
			id: 1,
			name: "BTC",
			principal: 10_000,
			rate: 0.1,
			compound: "monthly",
			contribution: 0,
			contributionFrequency: "monthly",
		},
	]);

	useEffect(() => {
		initSettings().catch((err) => {
			console.error("Failed to init settings", err);
		});
	}, []);

	return (
		<div className="flex flex-col gap-4">
			<Header />

			<div className="bg-grey-200 grid grid-cols-4 gap-4 mx-4">
				<p>
					Total Annual Income: {formatCurrency(calculateTotalAnnual(incomes))}
				</p>

				<p>
					Total Annual Expenses:{" "}
					{formatCurrency(calculateTotalAnnual(expenses))}
				</p>

				<div>
					<p>
						Total Annual Debt Payments:{" "}
						{formatCurrency(calculateTotalAnnualPayments(debts))}
					</p>
					<p>
						Outstanding Debt: {formatCurrency(calculateTotalPrinciple(debts))}
					</p>
					<p>
						DTI: {Math.round(calculateDebtToIncomeRatio(debts, incomes) * 100)}%
					</p>
				</div>

				<div>
					<p>
						Total Annual Contributions:{" "}
						{formatCurrency(calculateTotalAnnualPayments(assets))}
					</p>

					<p>
						Left over:{" "}
						{formatCurrency(
							calculateTotalAnnual(incomes) -
								calculateTotalAnnual(expenses) -
								calculateTotalAnnualPayments(debts) -
								calculateTotalAnnualPayments(assets),
						)}
					</p>
					<p>Total Assets: {formatCurrency(calculateTotalPrinciple(assets))}</p>
				</div>
			</div>

			<div className="grid grid-cols-4 items-start gap-4 px-4">
				<Incomes incomes={incomes} setIncomes={setIncomes} />
				<Expenses expenses={expenses} setExpenses={setExpenses} />
				<Debts debts={debts} setDebts={setDebts} />
				<Assets assets={assets} setAssets={setAssets} />
			</div>
		</div>
	);
}

export default App;
