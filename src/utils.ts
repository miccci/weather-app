export const formatDate = (dateString: string): string => dateString.slice(8, 10) + "." + dateString.slice(5, 7)

export const formatDayName = (dateString: string): string =>
  new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(dateString))
