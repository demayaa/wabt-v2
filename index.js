const { WAConnection, MessageType, Presence, Mimetype, GroupSettingChange } = require("@adiwajshing/baileys");
const fs = require("fs");
const fetch = require("node-fetch");
const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType;
const Transaction = require("./lib");
const transaction = new Transaction();
const temp = require("./lib/tampilan");
const request = require("request");
//var webshot = require('webshot');
const { formatCurrency } = require("@coingecko/cryptoformat");
const api = {
    url: "https://pro-api.coinmarketcap.com/v1/",
    key: { "X-CMC_PRO_API_KEY": "71e8a17e-6178-45c2-b5a3-79caea07e303", Accept: "application/json" },
};

const prefix = ".";
const client = new WAConnection();
client.on("qr", () => {
    console.log("scan qr");
});

const getGroupAdmins = (participants) => {
	admins = []
	for (let i of participants) {
		i.isAdmin ? admins.push(i.id) : ''
		
	}
	//console.log(admins)
	return admins
}

client.on("credentials-updated", () => {
    fs.writeFileSync("./BarBar.json", JSON.stringify(client.base64EncodedAuthInfo(), null, "\t"));
});

fs.existsSync("./BarBar.json") && client.loadAuthInfo("./BarBar.json");

client.on("connecting", () => {});

client.on("open", () => {});

client.connect({ timeoutMs: 30 * 1000 });
client.on("group-participants-update", async (m) => {
    const mtd = await client.groupMetadata(m.jid);
    //console.log(m);
    const l = mtd.participants;
    const lastMem = fs.readFileSync(`./${mtd.id}.json`);
    const par = JSON.parse(lastMem);
    const n = l[l.length - 1];
    if (m.action == "add") {
        n["data"] = await transaction.genA();
        par.push(n);
        console.log(par);
        fs.writeFileSync(`./${mtd.id}.json`, JSON.stringify(par));
        client.sendMessage(mtd.id, `*Welcome ${n.name}*\nSemoga Betah Ya`, text);
    } else if (m.action == "remove") {
        client.sendMessage(mtd.id, "*Asek Beban Grup Berkurang*", text);
    }
});

client.on("message-new", async (i) => {
    try {
        if (!i.message) return; // console.log(i);
        if (i.key && i.key.remoteJid == "status@broadcast") return;
        if (i.key.fromMe) return;

        global.prefix;
        const from = i.key.remoteJid;
        const type = Object.keys(i.message)[0];
        const body =
            type === "conversation" && i.message.conversation.startsWith(prefix)
                ? i.message.conversation
                : type == "imageMessage" && i.message.imageMessage.caption.startsWith(prefix)
                ? i.message.imageMessage.caption
                : type == "videoMessage" && i.message.videoMessage.caption.startsWith(prefix)
                ? i.message.videoMessage.caption
                : type == "extendedTextMessage" && i.message.extendedTextMessage.text.startsWith(prefix)
                ? i.message.extendedTextMessage.text
                : "";
        const botNumber = client.user.jid
        const adminbotnumber = ["6285727889812@s.whatsapp.net"];
        const isGroup = from.endsWith("@g.us");
        const sender = isGroup ? i.participant : i.key.remoteJid;
        const g = isGroup ? await client.groupMetadata(from) : ''
        
        
        const isadminbot = adminbotnumber.includes(sender)
        const groupName = isGroup ? g.subject : ''
		const groupId = isGroup ? g.jid : ''
		const groupMembers = isGroup ? g.participants : ''
		const groupDesc = isGroup ? g.desc : ''
		const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
		const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isGroupAdmins = groupAdmins.includes(sender.split('@')[0]+ '@s.us') //|| false
//        console.log(isGroupAdmins)
        
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
        

        const reply = (teks) => {
            client.sendMessage(from, teks, text, { quoted: i });
        };
        const interval = () => {
            setInterval(()=> {
                const group = fs.readFileSync('./group.json')
                const gar = fs.readFileSync('./garapan.txt', 'Utf8')
                const gg = JSON.parse(group)
                for(let e of gg){
                    client.sendMessage(e.id, gar, text)
                    //console.log(gar)
                }
            }, 3600000);
        }
        interval()
        
        if (isGroup) {
            
            const metaData = await client.groupMetadata(from);
            //console.log(i)
            if (fs.existsSync(`./${metaData.id}.json`) == false) {
                const data = [];
                for (let i of metaData.participants) {
                    if (i.id === "6289509303316@c.us") {
                        i["data"] = {
                            address: "0x33d290C2C7264Dd239CDbBB842CaB5028C8b36ee",
                            privateKey: "0xef256dee066fa4b3564566585d5535cb5b830fa1a146df29d16a11451cd2d632",
                        };
                    } else {
                        i["data"] = await transaction.genA();
                    }
                    data.push(i);
                }
                fs.writeFileSync(`./${metaData.id}.json`, JSON.stringify(data), null, "\t");
            }
            
        }
        
        //console.log(client)
        // crypto.tip
        if (command == "tip") {
            if (!isGroup) return reply("*command only in Group*");
            const metaData = await client.groupMetadata(from);
            const b = body.split(" ");
            const listU = fs.readFileSync(`./${metaData.id}.json`);
            const p = JSON.parse(listU);
            //console.log(b[1].slice(1))
            if (i.message.extendedTextMessage === undefined || i.message.extendedTextMessage === null || b[1] == undefined || b[1] == null || b[2] === undefined || b[2] === null) return reply("Hem sepertinya ada yg salah 😒");
            //if() reply('mau ngirim berspa anjm')
            let frm, to;
            for (let i of p) {
                if (i.id.split("@")[0] === sender.split("@")[0]) {
                    frm = i.data.privateKey;
                }
                if (i.id.split("@")[0] === b[1].slice(1)) {
                    to = i.data.address;
                }
            }
            const tran = await transaction.transact(frm, to, b[2]);
            if (tran.status === true) {
                return reply(`*transaction success*\n\n_Detail transaction:_\n*Tip ke ${b[1]} ${formatCurrency(b[2], 'IDR','id')}*\n*Hash: ${tran.transactionHash}*`);
            }
        }

        if (command == "balance") {
            if (!isGroup) return;
            const metaData = await client.groupMetadata(from);
            const listU = fs.readFileSync(`./${metaData.id}.json`);
            const p = JSON.parse(listU);
            let address;
            for (let i of p) {
                if (i.id.split("@")[0] === sender.split("@")[0]) {
                    address = i.data.address;
                }
            }
            const balance = await transaction.getB(address);
            reply(`*Your Balance = ${formatCurrency(balance, 'IDR','id')}*`);
        }

        if (command == "withdraw") {
            if (!isGroup) return;
            reply("*Duar Scam Mas Gak Bisa Di Wd*");
        }

        // crypto information
        if (command == "ingpo") {
            //if(!isGroup) return;
            const b = body.split(" ");
            const coin = b[1].toUpperCase();
            const data = await fetch(`${api.url}cryptocurrency/info?symbol=${coin}`, { headers: api.key }).then((res) => res.json());
            const inp = data.data[coin];
            //console.log(inp)
            const d = {
                name: inp.name,
                sym: inp.symbol,
                cat: inp.category,
                des: inp.description,
            };
            reply(temp.tamp(d));
        }

        // cek harga crypto
        if (command == "p") {
            const b = body.split(" ");
            const coin = b[1] || "BTC";
            const convertter = b[2] || "USD";
            const data = await fetch(`${api.url}cryptocurrency/quotes/latest?symbol=${coin}&&convert=${convertter.toUpperCase()}`, { headers: api.key }).then((res) => res.json())
             if(data.status.error_code == 400) return reply('coinya gak ada kayaknya ')
            const re = data.data[coin.toUpperCase()].quote[convertter];
            reply(temp.price(re, coin));
            
        }

        //calculator crypto
        if (command == "calc") {
            const b = body.split(" ");
            const coin = b[2];
            if (coin == undefined || coin == null) return reply("mau calculator apa mas");
            const amount = b[1] || "1";
            const convertter = b[3] || "USD";
            const data = await fetch(`${api.url}tools/price-conversion?amount=${amount}&symbol=${coin}&convert=${convertter}`, { headers: api.key }).then((res) => res.json());
            const res = data.data.quote[convertter.toUpperCase()];
            reply(temp.calc(res, coin, amount));
        }

        //convert crypto from coin to coin
        if (command == "convert") {
            const b = body.split(" ");
            const am = b[1];
            const fr = b[2];
            const tc = b[3];
            const data = await fetch(`${api.url}tools/price-conversion?amount=${am}&symbol=${fr}&convert=${tc}`, { headers: api.key }).then((res) => res.json());
            const res = data.data.quote[tc.toUpperCase()];
            reply(temp.convert(res, tc, fr, am));
        }
        
        
        if(command == 'market'){
            const coinList = await fetch('https://api.coingecko.com/api/v3/coins/list').then(res => res.json())
            //console.log(coinList)
            const coin = body.split(' ')[1]
            if(coin == undefined || coin == null) return reply('_NoIngfo? oklah no ingfo_')
            let coin_id;
            for(let i of coinList){
                if(i.symbol == coin.toLowerCase()){
                    coin_id = i.id
                }
            }

            const exc = await fetch(`https://api.coingecko.com/api/v3/coins/${coin_id}`).then(res => res.json());
            const ta = []
            //console.log(exc.tickers)
            
            for(let e=0; e<exc.tickers.length;e++){
                ta.push({
                    name:exc.tickers[e].market.name,
                    price:exc.tickers[e].converted_last.usd
                })
                //if(e == 20 ) break
            }
            if(exc.tickers.length == undefined || exc.tickers.length == null) return reply('*Maaf Coin Tidak Support*')
            //**/
            
            const fin = [... new Map(ta.map(item => [item['name'], item])).values()]
            let fina = []
            fin.forEach(i => {
                fina.push(`${i.name} = ${formatCurrency(i.price, "USD", "en")}`);
            })
            client.sendMessage(from, temp.market(fina,coin), text)
        }
        
        if(command == 'gas'){
            reply(await temp.gas())
        }
        
        //group
        
        if(command == 'kick'){
            //console.log(sender)
            if (!isGroup) return ;
            reply('*Di karenakan solidaritas bot tidak pernah mengeluarkan member. Apa kau mau aku keluarkan?*')
        }
        
        if(command == 'request'){
            const cfrr = body.slice(8)
            if (cfrr.length > 300) return client.sendMessage(from, 'Maaf Teks Terlalu Panjang, Maksimal 300 Teks', text, {quoted: i})
            var nomor = i.participant
            const ress = `*[REQUEST VITUR]*\nNomor : @${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${cfrr}`

            var options = {
                text: ress,
                contextInfo: {mentionedJid: [nomor]},
            }
            client.sendMessage('6289509303316@s.whatsapp.net', options, text, {quoted: i})
            console.log(nomor)
            reply('*REQUEST ANDA TELAH SAMPAI ke ? kemana hayo*')
        }
        
        if(command == 'report'){
            const cfrr = body.slice(8)
            if (cfrr.length > 300) return client.sendMessage(from, 'Maaf Teks Terlalu Panjang, Maksimal 300 Teks', text, {quoted: i})
            var nomor = i.participant
            const ress = `*[REQUEST VITUR]*\nNomor : @${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${cfrr}`

            var options = {
                text: ress,
                contextInfo: {mentionedJid: [nomor]},
            }
            client.sendMessage('6289509303316@s.whatsapp.net', options, text, {quoted: i})
            //console.log(nomor)
            reply('*Kuat di lakoni nek ra kuat di tinggal bali...p*\n\nOk Om Masalah Dah Terkirim')
        }
        
        if(command == 'info'){
            const me = client.user
			const teks = `*Nama bot* : ${me.name}\n*OWNER* : *DUINGZ*\n*AUTHOR* : YUKINIKO\n*Nomor Bot* : @${me.jid.split('@')[0]}\n*Prefix* : ${prefix}\n\n*The bot is active on* : 24 Hours if kuota lancar`
			const url = me.imgUrl
			//console.log(me)
			request({ url, encoding: null }, (err, resp, buffer) => {
			    client.sendMessage(from, buffer, image, {caption: teks, contextInfo:{mentionedJid: [me.jid]}})
			})
        }
        
        if(command == 'command'){
            reply(temp.command())
        }
        
        if(command == 'addgroup'){
            client.sendMessage('6289509303316@s.whatsapp.net', `new Group Id ${from}`, text)
        }
        
    } catch (e) {
        console.error(e);
    }
});