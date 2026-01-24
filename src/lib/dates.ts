/**
 * Get start and end dates for the week containing the given date
 * Week starts on Sunday
 */
export const getWeekBoundaries = (date: Date) => {
	const start = new Date(date)
	start.setDate(date.getDate() - date.getDay())
	start.setHours(0, 0, 0, 0)

	const end = new Date(start)
	end.setDate(start.getDate() + 6)
	end.setHours(23, 59, 59, 999)

	return { start, end }
}

/**
 * Get start and end dates for the month containing the given date
 */
export const getMonthBoundaries = (date: Date) => {
	const start = new Date(date.getFullYear(), date.getMonth(), 1)
	const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

	return { start, end }
}

/**
 * Get start of day for a given date
 */
export const getStartOfDay = (date: Date) => {
	const result = new Date(date)
	result.setHours(0, 0, 0, 0)
	return result
}

/**
 * Get end of day for a given date
 */
export const getEndOfDay = (date: Date) => {
	const result = new Date(date)
	result.setHours(23, 59, 59, 999)
	return result
}

/**
 * Format date for display
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
	}
	return new Intl.DateTimeFormat("en-US", options || defaultOptions).format(date)
}

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date)
}

/**
 * Format date as YYYY-MM-DD using local timezone (not UTC)
 * This avoids timezone shift issues when comparing dates
 */
export const formatDateKey = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

/**
 * Get start of month for a given date
 */
export const getStartOfMonth = (date: Date) => {
	return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Get end of month for a given date
 */
export const getEndOfMonth = (date: Date) => {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export const getRelativeTime = (date: Date) => {
	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
	const now = new Date()
	const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)

	const intervals = [
		{ unit: "year" as const, seconds: 31536000 },
		{ unit: "month" as const, seconds: 2592000 },
		{ unit: "week" as const, seconds: 604800 },
		{ unit: "day" as const, seconds: 86400 },
		{ unit: "hour" as const, seconds: 3600 },
		{ unit: "minute" as const, seconds: 60 },
	]

	for (const interval of intervals) {
		const count = Math.floor(diffInSeconds / interval.seconds)
		if (Math.abs(count) >= 1) {
			return rtf.format(count, interval.unit)
		}
	}

	return "just now"
}
