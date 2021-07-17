const node_ssh = require('node-ssh');
const fs = require('fs')
const { NodeSSH } = require('node-ssh')

const ssh = new NodeSSH()

const config = {
    host: '84.201.185.98',
    username: 'tixomirov95',
    agent: process.env.SSH_AUTH_SOCK,
    privateKey: path.normalize(`${__dirname}/../private-keys/server/privateturn.ppk`),
    passphrase: '41514151'
  }

async function run() {

  const connect = await ssh.connect(config)
  
  const coturnRestartCommand = await ssh.execCommand('sudo service coturn restart', { cwd: '/opt' })
  console.log('service coturn restart', coturnRestartCommand)

  const kurentoRestartCommand = await ssh.execCommand('sudo service kurento-media-server start', { cwd: '/opt' })
  console.log('service kurento-media-server start', kurentoRestartCommand)

  const connectionsCommand = await ssh.execCommand('sudo netstat -npta')
  console.log('netstat -npta', connectionsCommand)

  process.exit()
}

run();