export function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();

	return `${year}/${month}/${day} ${hours}:${minutes}`;
}

export function fomatDateString(dateString: string) {
	const date = new Date(dateString);
	return formatDate(date);
}
