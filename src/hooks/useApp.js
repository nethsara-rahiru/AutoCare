import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { getDatabase } from '../database/db';
import { vehiclesRepository } from '../database/repositories/vehicles';
import { servicesRepository } from '../database/repositories/services';
import { fuelRepository } from '../database/repositories/fuel';
import { remindersRepository } from '../database/repositories/reminders';
const Context = createContext(null);
export function AppProvider({ children }) {
  const [data, setData] = useState({ vehicles: [], services: [], fuel: [], reminders: [] });
  const [repos, setRepos] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const queue = useRef(Promise.resolve());
  const refresh = useCallback(async (source) => {
    const [vehicles, services, fuel, reminders] = await Promise.all([source.vehicles.list(), source.services.list(), source.fuel.list(), source.reminders.list()]);
    setData({ vehicles, services, fuel, reminders });
  }, []);
  const initialize = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const db = await getDatabase();
      const source = { vehicles: vehiclesRepository(db), services: servicesRepository(db), fuel: fuelRepository(db), reminders: remindersRepository(db) };
      await refresh(source); setRepos(source);
    } catch (e) { setError(e.message || 'Unable to open local data.'); } finally { setLoading(false); }
  }, [refresh]);
  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { const subscription = AppState.addEventListener('change', state => { if (state === 'active' && repos) refresh(repos).catch(e => setError(e.message)); }); return () => subscription.remove(); }, [repos, refresh]);
  const mutate = useCallback((table, operation, ...args) => {
    // Serialize writes so transaction scopes cannot interleave on the shared SQLite connection.
    const next = queue.current.then(async () => { const result = await repos[table][operation](...args); await refresh(repos); return result; });
    queue.current = next.catch(() => {});
    return next;
  }, [repos, refresh]);
  return <Context.Provider value={{ ...data, repos, loading, error, retry: initialize, mutate }}>{children}</Context.Provider>;
}
export const useApp = () => useContext(Context);
