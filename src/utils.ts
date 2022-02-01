export function strip(string: string, char: string) {
	const regex = new RegExp(`^${char}|\\${char}$`, 'g')
	return string.replace(regex, '');
}

export function getHeader(): { Authorization: string } | {} {
	const accessToken = localStorage.getItem("access-token")
	if (!accessToken)
		return {}
	return {"Authorization": "Bearer " + accessToken};
}