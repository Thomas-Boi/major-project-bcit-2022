/**
 * Get the difference between 2 numbers. Also round it
 * to decimalPlace.
 * @param a, the first number. 
 * @param b, the second number.
 * @param decimalPlace, how much we are rounding the delta result.
 * Default to 7 decimal place.
 * @returns 
 */
export function getDelta(a: number, b: number, decimalPlace: number=7): number {
	let delta = a - b
	return parseFloat(delta.toFixed(7))
}

/**
 * Get a video url from the public folder.
 * @param vidName the name of the video without an extension.
 * @returns a valid path pointing to a video hosted in the public folder.
 */
export function getVid(vidName: string) {
	return process.env.PUBLIC_URL + "/video/" + vidName + ".mp4"
}

/**
 * Get a random integer between the range of the min and max.
 * @param min - the min of the range. Inclusive. 
 * @param max - the max of the range. Exclusive, must be larger than min. 
 */
 export function getRandomInt(min: number, max: number) {
  if (max < min) {
    throw new Error(`max (${max}) should be more than min (${min}).`)
  }

  return Math.floor(Math.random() * (max - min)) + min
}

/**
 * Get a random value from the array.
 * If the array is empty, throw an error.
 * @param array - an array.
 */
 export function getRandomValue(array: Array<any>): any  {
	if (array.length === 0) throw new Error("Array is empty, can't pick a value from here.")
  let index = Math.floor(Math.random() * array.length);
  return array[index]; 
}

/**
 * Check whether the provided two ranges overlap each other. 
 * This also checks the boundary.
 * @param start1, start of the first range.
 * @param end1, end of the first range.
 * @param start2, start of the second range.
 * @param end2, end of the second range.
 */
export function areRangesOverlap(start1: number, end1: number, start2: number, end2: number) {
	// solution taken from https://stackoverflow.com/a/3269471/11683637
	return start1 <= end2 && start2 <= end1
}