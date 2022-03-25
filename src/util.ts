/**
 * Get the difference between 2 numbers. Also round it
 * to decimalPlace.
 * @param a, the first number. 
 * @param b, the second number.
 * @param decimalPlace, how much we are rounding the delta result.
 * Default to 7 decimal place.
 * @returns 
 */
export function getDelta(a: number, b: number, decimalPlace: number=7) {
	let delta = a - b

	// round to x decimal place, see https://stackoverflow.com/a/11832950/11683637
	let decimalConvertor = 10 ** decimalPlace
	delta = Math.round(delta * decimalConvertor) / decimalConvertor
	return delta
}
