interface EntityWithLength {
	length: number;
}

function isNullOrEmpty(val: EntityWithLength | null | undefined): boolean {
	return val == null || val.length === 0;
}


export { isNullOrEmpty };
