export default class ObjectUtils {
	/**
	 * Deep compare two objects
	 * @param obj1 First object
	 * @param obj2 Second object
	 * @returns True if objects are deeply equal, false otherwise
	 */
	static deepEqual(obj1: any, obj2: any): boolean {
		if (obj1 === obj2) {
			return true;
		}

		if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
			return false;
		}

		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) {
			return false;
		}

		for (const key of keys1) {
			const val1 = obj1[key];
			const val2 = obj2[key];

			const areObjects = ObjectUtils.isObject(val1) && ObjectUtils.isObject(val2);
			if (areObjects && !ObjectUtils.deepEqual(val1, val2) ||	!areObjects && val1 !== val2) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if given object is an object
	 * @param obj Object to check
	 * @returns True if object is an object, false otherwise
	 */
	static isObject(obj: any): boolean {
		return obj != null && typeof obj === 'object';
	}
}
