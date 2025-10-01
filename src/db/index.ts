import type { Frequency } from "@/utils/types";
import Dexie, { type EntityTable } from "dexie";

interface Scenario {
	id: number;
	name: string;
	age: number;
}

interface Settings {
	id: number;
	currentScenarioId: number;
}

interface Income {
	id: number;
	scenarioId: number;
	name: string;
	amount: number;
	frequency: Frequency;
}

interface Expense {
	id: number;
	scenarioId: number;
	name: string;
	amount: number;
	frequency: Frequency;
}

interface Debt {
	id: number;
	scenarioId: number;
	name: string;
	principal: number;
	interestRate: number;
	minimumPayment: number;
	frequency: Frequency;
}

interface Asset {
	id: number;
	scenarioId: number;
	name: string;
	value: number;
	growthRate: number;
	contribution: number;
	frequency: Frequency;
}

const db = new Dexie("CashMoneyDatabase") as Dexie & {
	scenarios: EntityTable<Scenario, "id">;
	settings: EntityTable<Settings, "id">;
	incomes: EntityTable<Income, "id">;
	expenses: EntityTable<Expense, "id">;
	debts: EntityTable<Debt, "id">;
	assets: EntityTable<Asset, "id">;
};

db.version(1).stores({
	scenarios: "++id, name, age",
	settings: "id, currentScenarioId",
	incomes: "++id, scenarioId, name, amount, frequency",
	expenses: "++id, scenarioId, name, amount, frequency",
	debts:
		"++id, scenarioId, name, principal, interestRate, minimumPayment, frequency",
	assets: "++id, scenarioId, name, value, growthRate, contribution, frequency",
});

export type { Scenario, Settings, Income, Debt, Asset };
export { db };
