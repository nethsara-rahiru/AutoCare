import { recordsRepository } from './records';
import { validateReminder } from '../../utils/validation';
export const remindersRepository = db => ({
  ...recordsRepository(db, { table: 'reminders', fields: ['vehicle_id','title','due_date','due_mileage','status','notes'], validate: validateReminder }),
  complete: id => db.runAsync("UPDATE reminders SET status = 'completed' WHERE id = ?", Number(id)),
});
