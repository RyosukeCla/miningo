import * as fs from 'fs'

export default function (newPath: string, oldPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(oldPath)
    const writeStream = fs.createWriteStream(newPath)

    const onError = () => {
      reject()
    }
    readStream.on('error', onError)
    writeStream.on('error', onError)

    readStream.on('close', () => {
      fs.unlink(oldPath, () => {
        resolve()
      })
    })

    readStream.pipe(writeStream)
  })
}
