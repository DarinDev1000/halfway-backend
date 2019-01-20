class ObjectCompare {

	static isEqual(value, other) {

		// Get the value type
		const type = Object.prototype.toString.call(value);

		// If the two objects are not the same type, return false
		if (type !== Object.prototype.toString.call(other)) return false;

		// If items are not an object or array, return false
		if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

		// Compare the length of the length of the two items
		const valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
		const otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
		if (valueLen !== otherLen) return false;

		// Compare two items
		const compare = function (item1, item2) {

			// Get the object type
			const itemType = Object.prototype.toString.call(item1);

			// If an object or array, compare recursively
			if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
				if (!isEqual(item1, item2)) return false;
			}

			// Otherwise, do a simple comparison
			else {

				// If the two items are not the same type, return false
				if (itemType !== Object.prototype.toString.call(item2)) return false;

				// Else if it's a function, convert to a string and compare
				// Otherwise, just compare
				if (itemType === '[object Function]') {
					if (item1.toString() !== item2.toString()) return false;
				} else {
					if (item1 !== item2) return false;
				}

			}
		};

		// Compare properties
		if (type === '[object Array]') {
			for (let i = 0; i < valueLen; i++) {
				if (compare(value[i], other[i]) === false) return false;
			}
		} else {
			for (let key in value) {
				if (value.hasOwnProperty(key)) {
					if (compare(value[key], other[key]) === false) return false;
				}
			}
		}

		// If nothing failed, return true
		return true;

	};

	// var arr1 = [1, 2, 3, 4, 5];
	// var arr2 = [1, 2, 3, 4, 5];
	// console.log(isEqual(arr1, arr2)); // returns true

	// var arrObj1 = [1, 2, {
	// 	a: 1,
	// 	b: 2,
	// 	c: 3
	// }, 4, 5];
	// var arrObj2 = [1, 2, {
	// 	c: 3,
	// 	b: 2,
	// 	a: 1
	// }, 4, 5];
	// console.log(isEqual(arrObj1, arrObj2)); // returns true

	// var arr1 = [1, 2, 3, 4, 5];
	// var arr3 = [5, 4, 3, 2, 1];
	// console.log(isEqual(arr1, arr3)); // returns false

	static difference(o1, o2) {
	var k, kDiff,
		diff = {};
	for (k in o1) {
		if (!o1.hasOwnProperty(k)) {
		} else if (typeof o1[k] != 'object' || typeof o2[k] != 'object') {
			if (!(k in o2) || o1[k] !== o2[k]) {
				diff[k] = o2[k];
			}
		} else if (kDiff = difference(o1[k], o2[k])) {
			diff[k] = kDiff;
		}
	}
	for (k in o2) {
		if (o2.hasOwnProperty(k) && !(k in o1)) {
			diff[k] = o2[k];
		}
	}
	for (k in diff) {
		if (diff.hasOwnProperty(k)) {
			return diff;
		}
	}
	return false;
	}

	// var arr1 = [1, 2, 3, 4, 5];
	// var arr2 = [1, 2, 3, 4, 5];
	// console.log(difference(arr1, arr2)); // returns true

	// var arrObj1 = [1, 2, {
	// 	a: 1,
	// 	b: 2,
	// 	c: 3
	// }, 4, 5];
	// var arrObj2 = [1, 2, {
	// 	c: 3,
	// 	b: 2,
	// 	a: 1
	// }, 4, 5];
	// console.log(difference(arrObj1, arrObj2)); // returns true

	// var arr1 = [1, 2, 3, 4, 5];
	// var arr3 = [5, 4, 3, 2, 1];
	// console.log(difference(arr1, arr3)); // returns false

}

module.exports = ObjectCompare;