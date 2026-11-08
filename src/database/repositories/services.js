import { recordsRepository } from "./records";
import { validateService } from "../../utils/validation";
export const servicesRepository = (db) =>
  recordsRepository(db, {
    table: "services",
    fields: [
      "vehicle_id",
      "service_type",
      "service_date",
      "mileage",
      "cost",
      "workshop",
      "notes",
    ],
    validate: validateService,
    dateField: "service_date",
    mileageField: "mileage",
  });
