'use strict'

const mongoose = require('mongoose') 
const os = require('os')
const process = require('process')
const _SECONDS = 50000;
//count Connect
const countConnect = () => {
  const numConnection = mongoose.connections.length
  console.log(`Number of connections::${numConnection}`)
}

//check over load
const checkOverLoad = () => {
  setInterval( () => {
    const numConnection = mongoose.connections.length
    let numCores = os.cpus().length; //get information about each logical CPU
    const memoryUsage = process.memoryUsage().rss; //Returns an object describing the memory usage of the Node process measured in bytes.

    const maxConnections = numCores = 5;

    // console.log(`Active connections:${numConnection}`);
    // console.log(`memoryUsage: ${memoryUsage /1024 / 1024}MB`);

    if(numConnection > maxConnections) {
      console.log(`Connection overload detected`);
    }
  }, _SECONDS) // 50sec
}

module.exports = {
  countConnect,
  checkOverLoad
}