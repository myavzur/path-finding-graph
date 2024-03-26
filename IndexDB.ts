import { Graph } from "./src/shared/Graph";

export type HouseTableColumns = {
	id: string;
	positionX: number;
	positionZ: number;
	assetTitle: string;
	houseAddress: string;
};

/*
	Используем паттерн Singleton.
	Зачем:
		1. Храним один объект для взаимодействия с IndexedDB в памяти.
		2. Нам нужно только одно соединение с БД, не более.
*/
export class IndexDB {
	static _INSTANCE: IndexDB | null = null;

	private DATABASE_NAME = "house";
	private VERSION = 1;

	private openRequest!: IDBOpenDBRequest;
	private database: IDBDatabase | null = null;

	onSuccessOpened: (() => void) | null = null;

	constructor() {
		if (IndexDB._INSTANCE === null) {
			this.openRequest = indexedDB.open(this.DATABASE_NAME, this.VERSION);
			this.openRequest.onupgradeneeded = this.handleUpgradeNeeded;
			this.openRequest.onsuccess = this.handleSuccessOpened;

			IndexDB._INSTANCE = this;
			return;
		}
		return;
	}

	private handleUpgradeNeeded = () => {
		const db = this.openRequest.result;

		if (!db.objectStoreNames.contains("houses")) {
			db.createObjectStore("houses", { keyPath: "id" });
		}

		if (!db.objectStoreNames.contains("housesPaths")) {
			db.createObjectStore("housesPaths");
		}

		this.database = db;
	};

	private handleSuccessOpened = () => {
		this.database = this.openRequest.result;
		this.onSuccessOpened?.();
	};

	saveHouseInfo(info: HouseTableColumns) {
		if (!this.database) return;

		const transaction = this.database.transaction("houses", "readwrite");
		const store = transaction.objectStore("houses");
		store.add(info);
	}

	getAllHousesInfo(): Promise<HouseTableColumns[]> {
		return new Promise((res) => {
			if (!this.database) {
				res([]);
				return;
			}

			const transaction = this.database.transaction("houses", "readwrite");
			const store = transaction.objectStore("houses");

			const request = store.getAll();
			request.onsuccess = (e) => {
				const target = e.target as unknown as { result: HouseTableColumns[] };
				res(target.result);
				return;
			};

			request.onerror = () => {
				res([]);
			};
		});
	}

	saveHousesGraph(houseGraph: Graph) {
		if (!this.database) return;
		const transaction = this.database.transaction("housesPaths", "readwrite");
		const store = transaction.objectStore("housesPaths");
		store.delete("paths");
		store.add(houseGraph, "paths");
	}

	getHousesGraph(): Promise<Graph | undefined> {
		return new Promise((res) => {
			if (!this.database) {
				res(undefined);
				return;
			}

			const transaction = this.database.transaction("housesPaths", "readwrite");
			const store = transaction.objectStore("housesPaths");
			const request = store.getAll();

			request.onsuccess = (e) => {
				const target = e.target as unknown as { result: Graph[] };
				res(target.result[0]);
				return;
			};

			request.onerror = () => {
				res(undefined);
			};
		});
	}
}