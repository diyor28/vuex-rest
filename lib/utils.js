export function strip(string, char) {
    const regex = new RegExp(`^${char}|\\${char}$`, 'g');
    return string.replace(regex, '');
}
export function getHeader() {
    const accessToken = localStorage.getItem("access-token");
    if (!accessToken)
        return {};
    return { "Authorization": "Bearer " + accessToken };
}
