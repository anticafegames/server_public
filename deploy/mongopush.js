const node_ssh = require('node-ssh');
const fs = require('fs')
const path = require('path')
const { NodeSSH } = require('node-ssh')
const { execSync } = require('child_process')

const ssh = new NodeSSH()

const config = {
    host: '84.201.189.200',
    username: 'tixomirov95',
    agent: process.env.SSH_AUTH_SOCK,
    privateKey: path.normalize(`${__dirname}/../private-keys/server/privatekey.ppk`),
    passphrase: '41514151'
}

//mongodump -d<dbname> -o <backUpPath>

const localDumpDir = path.normalize(`${__dirname}/mongo-dump`)
const remoteDumpDir = `/opt/mongo-dump`
const dbName = 'Anticafe'
const remoteDir = `${remoteDumpDir}/${dbName}`
const localDir = `${localDumpDir}/${dbName}`

async function createLocalDir() {

    if (fs.existsSync(localDumpDir)) {

        await new Promise(async (resolve) => {

            await fs.rmdir(`${localDumpDir}`, { recursive: true }, (err, data) => {

                if(err) {
                    console.log('rmdir', err) 
                }

                resolve()

            })
        })

        console.log('Удалили старую папку с логами')
    }

    fs.mkdirSync(localDumpDir)

    console.log('Создали новую папку с логами')
}


async function run() {

    const connect = await ssh.connect(config)

    const rmCommand = await ssh.execCommand(`sudo rm -rf ${remoteDumpDir}/*`)
    console.log('command rm remote dir', rmCommand)

    const mongodumpCommand = JSON.stringify(execSync(`mongodump -d ${dbName} -o ${localDumpDir}`))
    console.log('command mongodump', mongodumpCommand)

    const clearRemoteDirCommand = await ssh.execCommand(`sudo rm -rfw ${remoteDumpDir}/*`)
    console.log('command clear remote dir', clearRemoteDirCommand)

    const files = fs.readdirSync(localDir)
    console.log('Файлы для перенеса на сервер:', files)

    const s = await ssh.requestSFTP()

    try {

        while (files.length) {
            const file = files.pop()
            await ssh.putFile(`${localDir}/${file}`, `${remoteDir}/${file}`)
        }

    }
    catch (error) {
        console.log('push files error', error)
        process.exit()
    }

    const mongostoreCommand = await ssh.execCommand(`sudo mongorestore --drop --db ${dbName} ${remoteDir}`)
    console.log('command mongostore', mongostoreCommand)

    /*const connect = await ssh.connect(config)
    //const sudosu = await ssh.execCommand('sudo su -')
    const mongodumpCommang = await ssh.execCommand(`sudo mongodump -d ${dbName} -o ${remoteDumpDir}`, { cwd: '/opt/' })
    console.log('command mongodump', mongodumpCommang)
  
    const filesString = await ssh.execCommand('sudo ls', { cwd: remoteDir })
    let files = filesString.stdout.split('\n')
  
    console.log('Спимок файлов', files)
  
    try {
  
      while (files.length) {
        const file = files.pop()
        await ssh.getFile(localDir + `/${file}`, remoteDir + `/${file}`)
      }
  
    } catch (error) {
      console.log('load logs error', error)
    }
  
    const mongostoreCommang = JSON.stringify(execSync(`mongorestore --db ${dbName}  ${localDir}`))
    console.log('command mongostore', mongostoreCommang)*/

    process.exit()
}

createLocalDir()
run();