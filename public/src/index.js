const redux = require('redux');

// action Types
const SEND_MSG = 'SEND_MSG';

// actions
function sendMsg(msg, from = 'unknown user') {
  return {
    type: SEND_MSG,
    date: new Date().toDateString(),
    from, msg
  }
}

// reducer
function reducer(currentState, action) {
  const stateCopy = JSON.parse(JSON.stringify(currentState));

  switch (action.type) {
    case SEND_MSG :
    {
      stateCopy.msgList.push({
        from: action.from,
        msg: action.msg,
        date: action.date
      });

      return stateCopy;
    }

    default :
    {
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
// fetch dataStore from server
fetch('/getData').then(response => response.json()).then((data) => {
  const store = redux.createStore(reducer, data);

  fillMsgList(store.getState().msgList);

  // dispatch event
  function sendEditorMsg() {
    const msgEditor = document.querySelector('#msgEditor');
    if (!msgEditor.value) return;

    store.dispatch(sendMsg(msgEditor.value));

    fillMsgList(store.getState().msgList);

    syncStoreData();

    msgEditor.value = '';
  }
  document.querySelector('#sendMsg').addEventListener('click', sendEditorMsg);
  document.querySelector('#msgEditor').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) sendEditorMsg();
  });

  // sync store data to server
  function syncStoreData() {
    fetch('/syncData', {
      method: 'post',
      body: JSON.stringify(store.getState())
    });
  }
});

new WebSocket('ws://localhost:3000')


