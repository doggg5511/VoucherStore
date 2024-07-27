export const shortAddress = (inputString: string, maxLength = 20) => {
  if (inputString.length <= maxLength) return inputString;
  const prefixLength = Math.floor((maxLength - 3) / 2);
  const suffixLength = maxLength - prefixLength - 3;
  const prefix = inputString.substring(0, prefixLength);
  const suffix = inputString.substring(inputString.length - suffixLength);
  return `${prefix}...${suffix}`;
};

export const timestampToDate = (
  timestamp: number,
  type: "DATE" | "TIME" | "FULL",
) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  if (type === "DATE") {
    return `${day}/${month}/${year}`;
  } else if (type === "TIME") {
    return `${hours}:${minutes}`;
  } else {
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
};
