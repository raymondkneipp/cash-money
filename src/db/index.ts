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
	name: string;
	amount: number;
	frequency: Frequency;
	scenarioId: number;
}

const db = new Dexie("CashMoneyDatabase") as Dexie & {
	scenarios: EntityTable<Scenario, "id">;
	settings: EntityTable<Settings, "id">;
	incomes: EntityTable<Income, "id">;
};

db.version(1).stores({
	scenarios: "++id, name, age",
	settings: "id, currentScenarioId",
	incomes: "++id, name, amount, frequency, scenarioId",
});

export type { Scenario, Settings, Income };
export { db };
