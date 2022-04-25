export class IncantStateMachine {
  curState: IncantState

  waitState: IncantState

  /**
   * Add the state to the machine. If we are empty,
   * use it. Else, put it in this.waitState.
   * @param state 
   */
  addState(state: IncantState) {
    if (!this.curState) this.curState = state
    else {
      // see if we should change wait state
      if (this.waitState.priority < this.curState.priority)
      this.waitState = state
    }
  }

  /**
   * Remove the current state and insert 
   * the next state.
   */
  removeCurState() {
    if (this.waitState) this.curState = this.waitState
    else this.curState = undefined // just remove the state without assigning anything
  }

}

export class IncantState {
  /**
   * The priority of this state compared to other states.
   * The smaller, the more important it is. This determines
   * whether an IncantState is replaced.
   */
  priority: number

  constructor(priority: number) {
    this.priority = priority
  }
}

export const SELECTED_STATE = new IncantState(1)
export const NORMAL_FADE_OUT_STATE = new IncantState(1)
export const QUICK_FADE_OUT_STATE = new IncantState(0)