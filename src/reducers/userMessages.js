import Immutable from 'immutable'
import {
  ADD_USER_MESSAGE,
  DISMISS_USER_MSG,
  FAILED_EXTERNAL_ACTION,
  LOGIN_FAILED,
  SET_USERMSG_NOTIFIED,
  SET_USER_MESSAGES,
} from '_/constants'
import { actionReducer } from './utils'

/*flow-include
import type { FailedExternalAction } from '../actions/error'
*/

function addLogEntry ({ state, message, type = 'ERROR', failedAction }) {
  // TODO: use seq
  return state
    .set('unread', true)
    .update('records', records => records.unshift(Immutable.fromJS({
      message,
      type,
      failedAction,
      time: Date.now(),
      notified: false,
    })))
}

const initialState = Immutable.fromJS({
  records: [],
})

const userMessages = actionReducer(initialState, {
  // Log external action failures (i.e. AJAX calls) as user messages
  [FAILED_EXTERNAL_ACTION] (state, { payload: { message, shortMessage, type, failedAction } }/*: FailedExternalAction */) {
    return addLogEntry({
      state,
      message,
      shortMessage,
      type,
      failedAction,
    })
  },
  [LOGIN_FAILED] (state, { payload: { message, errorCode } }) {
    return addLogEntry({ state, message: message, type: errorCode })
  },

  [ADD_USER_MESSAGE] (state, { payload: { message, type = 'INFO' } }) {
    return addLogEntry({
      state, message, type,
    })
  },

  [SET_USER_MESSAGES] (state, { payload: { messages } }) {
    let newState = state.update('records', records => records.clear())
    for (let message of messages) {
      newState = newState.update('records', records => records.push(Immutable.fromJS({
        id: message.id,
        message: message.description,
        type: message.severity.toUpperCase(),
        time: message.time,
        notified: true,
      })))
    }
    return newState
  },

  [SET_USERMSG_NOTIFIED] (state, { payload: { time } }) {
    return state.setIn(['records', state.get('records').findIndex(r => r.get('time') === time), 'notified'], true)
  },

  [DISMISS_USER_MSG] (state, { payload: { time } }) {
    return state.update('records', records => records.delete(state.get('records').findIndex(r => r.get('time') === time)))
  },
})

export default userMessages
