const fs = require("node:fs")
const path = require("node:path")

const originalNativeRealpath = fs.realpathSync.native.bind(fs.realpathSync)
const cwd = path.resolve(process.cwd())
let restored = false

fs.realpathSync.native = (input) => {
  if (typeof input === "string" && path.resolve(input) === cwd) {
    if (!restored) {
      restored = true
      process.nextTick(() => {
        fs.realpathSync.native = originalNativeRealpath
      })
    }

    const error = new Error(`EISDIR: illegal operation on a directory, realpath '${cwd}'`)
    error.code = "EISDIR"
    error.errno = -21
    error.syscall = "realpath"
    error.path = cwd
    throw error
  }

  return originalNativeRealpath(input)
}
