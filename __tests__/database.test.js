import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openTestDatabase } from './sqliteAdapter';
import { migrate } from '../src/database/schema';
import { seed } from '../src/database/seed';
import { vehiclesRepository } from '../src/database/repositories/vehicles';
import { servicesRepository } from '../src/database/repositories/services';
import { fuelRepository } from '../src/database/repositories/fuel';
import { remindersRepository } from '../src/database/repositories/reminders';
import { expenses, monthlyExpenses } from '../src/utils/calculations';
let db,v,s,f,r,id;
const vehicle={registration_no:'TEST-123',make:'Toyota',model:'Prius',year:2015,fuel_type:'Hybrid',current_mileage:1000};
const service={service_type:'Engine Oil',service_date:'2026-10-01',mileage:1200,cost:16000,workshop:'Colombo'};
const fuel={filled_at:'2026-10-01',odometer:1100,liters:20,total_cost:6200,is_full_tank:1};
beforeEach(async()=>{db=openTestDatabase();await migrate(db);v=vehiclesRepository(db);s=servicesRepository(db);f=fuelRepository(db);r=remindersRepository(db);id=await v.save(vehicle);});
afterEach(()=>db.close());
test('create read search update and delete a vehicle',async()=>{
  expect((await v.get(id)).registration_no).toBe('TEST-123');
  expect(await v.list('prius')).toHaveLength(1);expect(await v.list('absent')).toHaveLength(0);
  await v.save({...vehicle,nickname:'My car'},id);expect((await v.get(id)).nickname).toBe('My car');
  await v.remove(id);expect(await v.get(id)).toBeNull();
});
test('duplicate registration is case insensitive',async()=>{await expect(v.save({...vehicle,registration_no:'test-123'})).rejects.toThrow('already exists');});
test('service CRUD and vehicle filtering',async()=>{
  const record=await s.save({...service,vehicle_id:id});expect(await s.list(id)).toHaveLength(1);expect(await s.list(id+1)).toHaveLength(0);
  await s.save({...service,vehicle_id:id,cost:18000},record);expect((await s.get(record)).cost).toBe(18000);expect((await v.get(id)).current_mileage).toBe(1200);
  await s.save({...service,vehicle_id:id,mileage:900});expect((await v.get(id)).current_mileage).toBe(1200);
  await s.remove(record);expect(await s.get(record)).toBeNull();
});
test('fuel CRUD and safe mileage update',async()=>{
  const record=await f.save({...fuel,vehicle_id:id});expect((await v.get(id)).current_mileage).toBe(1100);
  await f.save({...fuel,vehicle_id:id,total_cost:6500},record);expect((await f.get(record)).total_cost).toBe(6500);
  await f.remove(record);expect(await f.list(id)).toHaveLength(0);
});
test('reject chronological odometer conflicts on create and update',async()=>{
  const first=await f.save({...fuel,vehicle_id:id});await f.save({...fuel,vehicle_id:id,filled_at:'2026-10-10',odometer:1500});
  await expect(f.save({...fuel,vehicle_id:id,filled_at:'2026-10-05',odometer:1600})).rejects.toThrow('Odometer conflicts');
  await expect(f.save({...fuel,vehicle_id:id,odometer:1600},first)).rejects.toThrow('Odometer conflicts');
  expect(await f.list()).toHaveLength(2);
});
test('invalid quantity rejected before write',async()=>{await expect(f.save({...fuel,vehicle_id:id,liters:0})).rejects.toThrow();expect(await f.list()).toHaveLength(0);});
test('date and mileage reminders can complete and delete',async()=>{
  const a=await r.save({vehicle_id:id,title:'Oil',due_date:'2026-11-10'});
  const b=await r.save({vehicle_id:id,title:'Tires',due_mileage:2000});
  await r.complete(a);expect((await r.get(a)).status).toBe('completed');
  await r.save({vehicle_id:id,title:'Tires updated',due_mileage:2500},b);expect((await r.get(b)).due_mileage).toBe(2500);
  await r.remove(b);expect(await r.list()).toHaveLength(1);
});
test('foreign key rejection and cascading deletion',async()=>{
  await expect(s.save({...service,vehicle_id:999})).rejects.toThrow();
  await s.save({...service,vehicle_id:id});await f.save({...fuel,vehicle_id:id});await r.save({vehicle_id:id,title:'Oil',due_mileage:2000});
  await v.remove(id);expect(await s.list()).toHaveLength(0);expect(await f.list()).toHaveLength(0);expect(await r.list()).toHaveLength(0);
});
test('seed once and migrations preserve deleted demo records',async()=>{
  await v.remove(id);await seed(db);expect(await v.list()).toHaveLength(3);expect(await s.list()).toHaveLength(12);expect(await f.list()).toHaveLength(15);expect(await r.list()).toHaveLength(6);
  const sample=(await v.list())[0];await v.remove(sample.id);await migrate(db);await seed(db);expect(await v.list()).toHaveLength(2);
});
test('dashboard totals and monthly reports reflect changes',async()=>{
  const a=await s.save({...service,vehicle_id:id});await f.save({...fuel,vehicle_id:id});
  expect(expenses(await s.list(),await f.list()).total).toBe(22200);
  expect(monthlyExpenses(await s.list(),await f.list())).toEqual([{label:'2026-10',value:22200}]);
  await s.remove(a);expect(expenses(await s.list(),await f.list()).total).toBe(6200);
});
test('data survives database close and reopen',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'autocare-')),path=join(dir,'persist.db');let disk=openTestDatabase(path);
  try {await migrate(disk);await vehiclesRepository(disk).save(vehicle);disk.close();disk=openTestDatabase(path);await migrate(disk);expect(await vehiclesRepository(disk).list()).toHaveLength(1);}finally{disk.close();rmSync(dir,{recursive:true,force:true});}
});
test('vehicle edits cannot undercut recorded service or fuel mileage',async()=>{
  await s.save({...service,vehicle_id:id});
  await expect(v.save({...vehicle,current_mileage:1100},id)).rejects.toThrow('Mileage cannot be lower');
  expect((await v.get(id)).current_mileage).toBe(1200);
});
