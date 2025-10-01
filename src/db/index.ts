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

const db = new Dexie("CashMoneyDatabase") as Dexie & {
	scenarios: EntityTable<Scenario, "id">;
	settings: EntityTable<Settings, "id">;
};

// Schema declaration:
db.version(1).stores({
	scenarios: "++id, name, age",
	settings: "id, currentScenarioId",
});

export type { Scenario, Settings };
export { db };
