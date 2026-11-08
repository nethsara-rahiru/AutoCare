import { expenses, fuelStats, monthlyExpenses, reminderStatus } from '../src/utils/calculations';
import { validateVehicle, validateService, validateFuel, validateReminder, validDate } from '../src/utils/validation';
const vehicle = { registration_no:' abc-123 ',make:'Toyota',model:'Prius',year:'2015',fuel_type:'Hybrid',current_mileage:'100' };
const log = (id, odometer, liters, full = 1, vehicle_id = 1) => ({id,vehicle_id,filled_at:`2026-10-${String(id).padStart(2,'0')}`,odometer,liters,total_cost:liters*310,is_full_tank:full});
describe('expense and fuel calculations',()=>{
  test('totals and monetary rounding',()=>expect(expenses([{cost:0.1},{cost:0.2}],[{total_cost:10}])).toEqual({serviceCost:0.3,fuelCost:10,total:10.3}));
  test('monthly breakdown includes both sources',()=>expect(monthlyExpenses([{service_date:'2026-10-10',cost:100}],[{filled_at:'2026-10-20',total_cost:200}])).toEqual([{label:'2026-10',value:300}]));
  test('weighted average price and later tank quantity',()=>{const s=fuelStats([log(1,100,20),log(2,500,25),log(3,1000,25)]);expect(s.cost).toBe(21700);expect(s.averagePrice).toBe(310);expect(s.efficiency).toBe(18);});
  test('insufficient data yields null',()=>expect(fuelStats([log(1,100,20)]).efficiency).toBeNull());
  test('partial fills break intervals',()=>expect(fuelStats([log(1,100,20),log(2,300,10,0),log(3,500,20)]).efficiency).toBeNull());
  test('vehicles never cross match',()=>expect(fuelStats([log(1,100,20),log(2,500,25,1,2)]).efficiency).toBeNull());
  test('nonincreasing readings excluded',()=>expect(fuelStats([log(1,500,20),log(2,400,25)]).efficiency).toBeNull());
});
describe('reminder precedence',()=>{
  const now='2026-11-08';
  test.each([
    [{due_date:'2026-11-09'},100,'Upcoming'],[{due_date:now},100,'Due'],[{due_date:'2026-11-07'},100,'Overdue'],
    [{due_mileage:200},100,'Upcoming'],[{due_mileage:100},100,'Due'],[{due_mileage:90},100,'Overdue'],
    [{due_date:'2026-11-07',status:'completed'},100,'Completed'],[{due_date:now,due_mileage:90},100,'Overdue'],
    [{due_date:'2026-11-07',due_mileage:200},100,'Overdue'],
  ])('%j at %i is %s',(r,m,status)=>expect(reminderStatus(r,m,now)).toBe(status));
});
describe('input validation',()=>{
  test('valid vehicle normalized',()=>expect(validateVehicle(vehicle).registration_no).toBe('ABC-123'));
  test.each(['registration_no','make','model','year','current_mileage'])('reject missing %s',key=>expect(()=>validateVehicle({...vehicle,[key]:''})).toThrow());
  test('invalid year and negative mileage rejected',()=>{expect(()=>validateVehicle({...vehicle,year:1800})).toThrow();expect(()=>validateVehicle({...vehicle,current_mileage:-1})).toThrow();});
  test('invalid dates rejected',()=>{expect(validDate('2026-02-30')).toBe(false);expect(validDate('2024-02-29')).toBe(true);expect(validDate('nonsense')).toBe(false);});
  test('service amount rounded',()=>expect(validateService({vehicle_id:1,service_type:'Engine Oil',service_date:'2026-10-10',mileage:10,cost:12.345}).cost).toBe(12.35));
  test.each([0,-1,''])('reject litres %s',liters=>expect(()=>validateFuel({vehicle_id:1,filled_at:'2026-10-10',odometer:100,liters,total_cost:100})).toThrow());
  test('reject negative fuel costs',()=>expect(()=>validateFuel({vehicle_id:1,filled_at:'2026-10-10',odometer:100,liters:10,total_cost:-1})).toThrow());
  test('require at least one reminder target',()=>expect(()=>validateReminder({vehicle_id:1,title:'Oil',due_date:'',due_mileage:''})).toThrow());
});
