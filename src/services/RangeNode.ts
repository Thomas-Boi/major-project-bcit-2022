export default class RangeNode {
  /**
  * Start value of this range (inclusive)
  */
  start: number 

  /**
  * End value of this range (exlucsive).
  */
  end: number

  /**
   * Represent a range of available space on the screen.
   * @param start start value of range.
   * @param end end value of range.
   */
  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }
}