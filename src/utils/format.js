export const money = (value = 0) =>
  `LKR ${Number(value).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const km = (value = 0) => `${Number(value).toLocaleString("en-LK")} km`;
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const dateLabel = (value) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No date target";
export const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;
