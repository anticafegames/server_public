const fs = require('fs-extra')
const path = require('path')
const { NodeSSH } = require('node-ssh')

const ssh = new NodeSSH()

const config = {
    host: '84.201.189.200',
    username: 'tixomirov95',
    agent: process.env.SSH_AUTH_SOCK,
    privateKey: path.normalize(`${__dirname}/../private-keys/server/privatekey.ppk`),
    passphrase: '41514151'
}

const logsDir = path.normalize(`${__dirname}/../logs/prod-logs`)
const remoteLogsDir = `../../opt/server/logs`

async function createLogsDir() {

    if (fs.existsSync(logsDir)) {

        await new Promise((resolve) => {

            fs.remove(logsDir, error => {

                if (error) {
                    throw new Error(error)
                }

                resolve()
            })
        })

        console.log('Удалили старую папку с логами')
    }

    fs.mkdirSync(logsDir)
    console.log('Создали новую папку с логами')
}

async function run() {

    const connect = await ssh.connect(config)

    const filesString = await ssh.execCommand('sudo ls', { cwd: '/opt/server/logs' })
    let files = filesString.stdout.split('\n')

    console.log('Спимок файлов', files)

    try {

        while (files.length) {
            const file = files.pop()
            await ssh.getFile(logsDir + `/${file}`, remoteLogsDir + `/${file}`)
        }

    } catch (error) {
        console.log('load logs error', error)
    }

    process.exit()
}

createLogsDir()
run()