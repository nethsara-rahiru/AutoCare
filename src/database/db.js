import { openDatabaseAsync } from "expo-sqlite";
import { migrate } from "./schema";
import { seed } from "./seed";
let opening;
export function getDatabase() {
  if (!opening)
    opening = (async () => {
      const db = await openDatabaseAsync("autocare.db");
      await migrate(db);
      await seed(db);
      return db;
    })().catch((error) => {
      opening = null;
      throw error;
    });
  return opening;
}
