import { customType } from "drizzle-orm/sqlite-core"

export const jsonText = <T>() => customType<{ data: T; driverData: string }>({
  dataType: () => "text",
  toDriver: (value: T) => JSON.stringify(value),
  fromDriver: (value: string) => JSON.parse(value) as T,
})

export const textArray = () => customType<{ data: string[]; driverData: string }>({
  dataType: () => "text",
  toDriver: (value: string[]) => JSON.stringify(value),
  fromDriver: (value: string) => JSON.parse(value) as string[],
})
