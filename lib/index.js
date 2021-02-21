const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;


class Transaction{
    constructor(){
        this.web3 = new Web3('http://test.cryptoice.biz')
    }
    
    async genA(){
        return await this.web3.eth.accounts.create()
    }
    async getB(address){
        const b = await this.web3.eth.getBalance(address);
        const v = this.web3.utils.fromWei(b, 'ether')
        return v
    }
    
    async transact(priv, to, amount){
        const key = this.web3.eth.accounts.privateKeyToAccount(priv);
        const address = key.address;
        const data = {
            from: address,
            gasPrice: await this.web3.eth.getGasPrice(),
            gas: "21000",
            to: to,
            value: this.web3.utils.toWei(amount, 'ether'),
            data: ""
        }
        const raw = await key.signTransaction(data)
        const res = await this.web3.eth.sendSignedTransaction(raw.rawTransaction)
        return res
    }
    
    async gas(value){
        value = value*21000
        const towei = this.web3.utils.fromWei(`${value}000000000`, 'ether')
        //const eth = this.web3.utils.fromWei(towei, 'ether')
        //console.log(towei)
        //console.log(towei)
        //this.web3.setProvider('wss://mainnet.infura.io/ws/v3/dcaff8ece739420a834123b407b373f4')
        //let gasPrice = await this.web3.eth.getGasPrice()
        return towei
    }
}

module.exports = Transaction;
//new Transaction().getB('0xa2d8fe69245244a07c5fa7a2a7e11247bd6cd312')
