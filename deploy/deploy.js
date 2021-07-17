const node_ssh = require('node-ssh');
const fs = require('fs')
const { NodeSSH } = require('node-ssh')
const path = require('path')

const ssh = new NodeSSH()

const config = {
    host: '84.201.189.200',
    username: 'tixomirov95',
    agent: process.env.SSH_AUTH_SOCK,
    privateKey: path.normalize(`${__dirname}/../private-keys/server/privatekey.ppk`),
    passphrase: '41514151'
  }

async function run() {

  const connect = await ssh.connect(config)
  //const sudosu = await ssh.execCommand('sudo su -')
  const gitPullCommang = await ssh.execCommand('sudo git pull', { cwd: '/opt/server/' })
  console.log('command git pull', gitPullCommang)

  console.log('Если нужно выполить npm i, то раскомментите строку')
  /*const npmi = await ssh.execCommand('sudo npm i', { cwd: '/opt/server' })
  console.log('command npm i', npmi)*/

  const build = await ssh.execCommand('sudo npm run build', { cwd: '/opt/server' })
  console.log('command build', build)

  const pm2Stop = await ssh.execCommand('sudo pm2 stop app', { cwd: '/opt/server' })
  console.log('command build', pm2Stop)

  //Есть воч но почему-то не работает
  const pm2Start = await ssh.execCommand('sudo pm2 start ./dist/app.js', { cwd: '/opt/server' })
  console.log('command build', pm2Start)

  process.exit()
}

run();