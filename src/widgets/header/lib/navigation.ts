export function normalizeNavPath(pathname: string): string {
	return pathname.replace(/\/+$/, '') || '/';
}

export function isCurrentNavPath(currentPathname: string, itemUrl: string): boolean {
	if (itemUrl.includes('#')) return false;
	const currentPath = normalizeNavPath(currentPathname);
	const linkPath = normalizeNavPath(itemUrl.split('#')[0] || '/');
	return (
		currentPath === linkPath ||
		(linkPath !== '/' && linkPath !== '/es' && currentPath.startsWith(`${linkPath}/`))
	);
}
