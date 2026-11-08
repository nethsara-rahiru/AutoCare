// Real SQLite engine, exposed through the same async API the repositories use on Expo.
const { DatabaseSync } = require("node:sqlite");
export function openTestDatabase(path = ":memory:") {
  const raw = new DatabaseSync(path);
  return {
    raw,
    execAsync: async (sql) => raw.exec(sql),
    getFirstAsync: async (sql, ...params) =>
      raw.prepare(sql).get(...params) || null,
    getAllAsync: async (sql, ...params) => raw.prepare(sql).all(...params),
    runAsync: async (sql, ...params) => {
      const result = raw.prepare(sql).run(...params);
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: Number(result.changes),
      };
    },
    withTransactionAsync: async (fn) => {
      raw.exec("BEGIN");
      try {
        await fn();
        raw.exec("COMMIT");
      } catch (e) {
        raw.exec("ROLLBACK");
        throw e;
      }
    },
    close: () => raw.close(),
  };
}
