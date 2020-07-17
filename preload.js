const net = require('net')

/**
 * 端口状态
 */
const status = {
  open: Symbol('开放'),
  close: Symbol('关闭')
}

/**
 * 单个扫描
 * @param {Number} port 端口
 * @param {String} host 地址
 */
const scan = (port, host) => {
  return new Promise((resolve, reject) => {
    let timer = null;

    const connection = net.connect({
      host: host,
      port: port
    }, function() {
      clearTimeout(timer)
      connection.destroy()
      resolve({ port, status: status.open })
    })

    connection.on('error', function(error) {
      clearTimeout(timer)
      resolve({ port, status: status.close })
    })

    timer = setTimeout(() => {
      connection.destroy()
      resolve({ port, status: status.close })
    }, 1000)
  })
}

let _stop = false

/**
 * 批量扫描
 * @param {String} host 地址
 * @param {Number} start 开始端口
 * @param {Number} end 结束端口
 * @param {Function} callback 回调
 */
const batchScan = async (host, start, end, callback) => {
  _stop = false
  _scan(host, start, end, callback)
  return {
    stop: () => _stop = true
  }
}

const _scan = async (host, start, end, callback) => {
  for (let index = start; index <= end; index++) {
    if (_stop) {
      break
    }
    const result = await scan(index, host)
    callback(result)
  }
}

window.scan = scan
window.batchScan = batchScan