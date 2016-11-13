const redux = require('redux');
const ws = new WebSocket('ws://localhost:3000');

let store;

const createWebSocketMiddleware = ws => ({getState, dispatch}) => dispatch => action => {

  dispatch(action);

  if (!action._isBroadcast) {
    const sendMsg = {
      type: 'syncAction',
      data: JSON.stringify(action)
    };

    ws.send(JSON.stringify(sendMsg));
  }
};

ws.onmessage = function (msg) {
  const parsedData = JSON.parse(msg.data);

  switch (parsedData.type) {
    case 'getData': {
      return store = initPage(JSON.parse(parsedData.data));
    }

    case 'updateData': {
      store.dispatch(JSON.parse(parsedData.data));
      return fillMsgList(store.getState().msgList);
    }
  }
};

// action Types
const SEND_MSG = 'SEND_MSG';
const UPDATE_STORE = 'UPDATE_STORE';

// actions
function sendMsg(msg, from = 'unknown user') {
  return {
    type: SEND_MSG,
    date: new Date().toDateString(),
    from, msg
  }
}

function updateStore(storeData) {
  return {
    type: UPDATE_STORE,
    data: storeData
  }
}

// reducer
function reducer(currentState, action) {
  const stateCopy = JSON.parse(JSON.stringify(currentState));

  switch (action.type) {
    case SEND_MSG: {
      stateCopy.msgList.push({
        from: action.from,
        msg: action.msg,
        date: action.date
      });

      return stateCopy;
    }

    case UPDATE_STORE: {
      return action.data
    }

    default: {
      return currentState;
    }
  }
}

// fill page with store data
function fillMsgList(msgList) {
  const msgListContainer = document.querySelector('#msgListContainer');
  let liString = '';
  msgList.forEach((listInfo) => {
    liString += `<li>${listInfo.from}: ${listInfo.msg}</li>`;
  });
  msgListContainer.innerHTML = liString;
}

// init store
function initPage(storeData) {
  const store = redux.applyMiddleware(createWebSocketMiddleware(ws))(redux.createStore)(reducer, storeData);

  fillMsgList(store.getState().msgList);

  document.querySelector('#sendMsg').addEventListener('click', sendEditorMsg);
  document.querySelector('#msgEditor').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) sendEditorMsg();
  });

  return store;

  function syncStoreData() {
    const sendMsg = {
      type: 'syncData',
      data: JSON.stringify(store.getState())
    };

    ws.send(JSON.stringify(sendMsg));
  }

  // dispatch event
  function sendEditorMsg() {
    const msgEditor = document.querySelector('#msgEditor');
    if (!msgEditor.value) return;

    store.dispatch(sendMsg(msgEditor.value));

    fillMsgList(store.getState().msgList);

    syncStoreData();

    msgEditor.value = '';
  }
}

