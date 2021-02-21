const { formatCurrency } = require("@coingecko/cryptoformat");
var moment = require('moment'); // 
require('moment-duration-format')
const fetch = require('node-fetch')
const Transaction = require('./index');
const tx = new Transaction()

exports.tamp = (data) =>{
    return `*━━°❀ ❬  Ingponya Bos ❭ ❀°━━*

*coin name   : ${data.name}*
*coin symbol : ${data.sym}*
*category    : ${data.cat}*
*description : ${data.des}*


~_Ingpo ini di persembahkan oleh :_~
*_CoinMarketCap_*
    `
}

exports.price = (data,coin) => {
    return `*━━°❀ ❬  Price ${coin} ❭ ❀°━━*

*price : ${formatCurrency(data.price, 'USD', 'en')}*
*Volume 24 hours : ${formatCurrency(data.volume_24h, 'USD', 'en')}*
*percent 1 hours : ${data.percent_change_1h} %*
*percent 24 hours : ${data.percent_change_24h} %*
*percent 7 days : ${data.percent_change_7d} %*
*percent 30 days : ${data.percent_change_30d} %*
*market cap : ${formatCurrency(data.market_cap, 'USD', 'en')}*
*last updated : ${data.last_updated}*


~_Price ini di persembahkan oleh :_~
*_CoinMarketCap_*
`
}

exports.calc = (data, coin, amount) => {
    return `*━━°❀ ❬  Price ${amount} ${coin} ❭ ❀°━━*

Total : ${formatCurrency(data.price, 'USD', 'en')}

last updated : ${data.last_updated}


~_Calculator ini di persembahkan oleh :_~
*_CoinMarketCap_*
`
}

exports.convert = (data, to, from, amount) =>{
    let total
    if(to.toUpperCase() == 'IDR'){
    total = formatCurrency(data.price, 'IDR', 'id')
    } else {
        total = data.price
    }
    return `*━━°❀ ❬  Convert ${amount} ${from} ${to} ❭ ❀°━━*

Total : ${total}

~_Converter ini di persembahkan oleh :_~
*_CoinMarketCap_*
`
}


exports.market = (fina,coin) => {
    return `*━━°❀ ❬  Market ${coin} ❭ ❀°━━*

┃  ${fina.join('=>').replace(/=>/g,"\n┃  ")}


*_Data ini di persembahkan oleh :_*
*_CoinGecko_*
`
}

exports.gas = async () => {
    const data = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=DNCWUIR9GBCS7DIERYIIWPZ9Z2117IJ9ZZ').then(res => res.json())
    const {LastBlock,SafeGasPrice, ProposeGasPrice, FastGasPrice} = data.result
    const b = [SafeGasPrice,ProposeGasPrice,FastGasPrice]
    const r = []
    for(let i in b){
        const da = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=${b[i]*1000000000}&apikey=DNCWUIR9GBCS7DIERYIIWPZ9Z2117IJ9ZZ`).then(res => res.json());
        let t;
        if(da.result<100){
            t = 'seconds'
        }else{
            t = 'minute'
        }
        r.push(`fee : ${await tx.gas(parseInt(b[i]))} ETH time : ${moment.duration(da.result,"seconds").format("mm:ss")} ${t}`)
    }
    return `
━━°❀ ❬ *Gas Tricker* ❭ ❀°━━
┃  ${r.join('=>').replace(/=>/g,"\n┃  ")}


*_Data ini di persembahkan oleh :_*
*_Etherscan.io_*
`
}

exports.command = () => {
    const text = `
    
    ━━°❀ ❬ *COMMAND NYA BOS* ❭ ❀°━━
    
┃   [ Tip Idr ]
┃   
┃   .tip [tag username] [amount]
┃   .balance 
┃   .withdraw
┃
┃   [Cryptocurrency]
┃
┃   .ingpo [coin]
┃   .p [coin]
┃   .calc [amount] [coin]
┃   .convert [amount] [from coin] [to coin]
┃   .market [coin]
┃   .gas
┃   
┃   [Group]
┃
┃   .kick [tag username]
┃   .request [text]
┃   .report [text]
┃   .info
┃   .command
┃`
    return text
}