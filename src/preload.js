// in preload scripts, we have access to node.js and electron APIs
// the remote web app will not, so this is safe
const { ipcRenderer: ipc, remote, } = require('electron')

init()

function init () {
  attachIPCListeners()

  // Expose a bridging API to remote app's window.
  // We'll add methods to it here first, and when the remote web app loads,
  // it'll add some additional methods as well.
  //
  // !CAREFUL! do not expose any functionality or APIs that could compromise the
  // user's computer. E.g. don't directly expose core Electron (even IPC) or node.js modules.
  window.Bridge = {
    setDockBadge,
  }
}

function attachIPCListeners () {
  // we get this message from the main process, and then tell the todo app to make it so
  // the todo app defines this function
  ipc.on('markAllComplete', () => {
    window.Bridge.markAllComplete()
  })
}

// the todo app calls this when the todo count changes
function setDockBadge (count) {
  if (process.platform === 'darwin') {
    remote.app.dock.setBadge('' + (count || ''))
  }
}

ipc.on('SET_SOURCE', async (event, sourceId) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 3000,
          minHeight: 720,
          maxHeight: 3000,
          maxFrameRate: 30,
        },
      },
    })
    handleStream(stream)
  } catch (e) {
    handleError(e)
  }
})

function handleStream (stream) {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
}

function handleError (e) {
  // console.log(e)
}
