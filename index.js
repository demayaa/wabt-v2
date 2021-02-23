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

const cekGroup = (cl,id) => {
    const data = JSON.parse(fs.readFileSync('./group.json'));
    for(let i of data){
        if(i.id == id) return;
    }
    return cl.sendMessage('6289509303316@s.whatsapp.net', `*new Group* \n*Id : ${from}*\n*nama : ${g.subject}*`, text)
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
        if(isGroup){
            cekGroup(client, from)
        }

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
        
        // crypto information
        if (command == "infocoin") {
            //if(!isGroup) return;
            //if(cekGroup(from) == false) return;
            const b = body.split(" ");
            const coin = b[1].toUpperCase();
            const data = await fetch(`${api.url}cryptocurrency/info?symbol=${coin}`, { headers: api.key }).then((res) => res.json());
            if(data.status.error_code == 400) return reply('*coinya gak ada kayaknya*')
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
        
        if(command == 'infoBot'){
            if(cekGroup(from) == false) return;
            const me = client.user
			const teks = `*Nama bot* : ${me.name}\n*OWNER* : *CryptoTeam*\n*AUTHOR* : Demayaa\n*Nomor Bot* : @${me.jid.split('@')[0]}\n*Prefix* : ${prefix}\n\n*The bot is active on* : 24 Hours if kuota lancar`
			const url = me.imgUrl
			//console.log(me)
			request({ url, encoding: null }, (err, resp, buffer) => {
			    client.sendMessage(from, buffer, image, {caption: teks, contextInfo:{mentionedJid: [me.jid]}})
			})
        }
        
        // cek harga crypto
        if (command == "p") {
            const b = body.split(" ");
            const coin = b[1] || "BTC";
            const convertter = b[2] || "USD";
            const data = await fetch(`${api.url}cryptocurrency/quotes/latest?symbol=${coin}&&convert=${convertter.toUpperCase()}`, { headers: api.key }).then((res) => res.json())
             if(data.status.error_code == 400) return reply('*coinya gak ada kayaknya*')
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
            if(cekGroup(from) == false) return;
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
    
        
        if(command == 'command'){
            reply(temp.command())
        }
        
        if(command == 'bot'){
            const com = body.split(' ')[1]
            if(com == 'nyala'){
                reply('*Ok Bos Bot Sudah Nyala*')
            }else if(com == 'mati'){
                reply('*Wait Process ShutDown*')
            }
        }
        
        if(command == 'trans'){
            const b = body.slice(10)
            const leng = body.split(' ')[1]
            const da = await temp.trans(b, leng)
            return reply(`*${da}*`)
        }
        
        if(command == 'transcode'){
            const leng = `*104 Code Negara*\n\n
af    =     Afrikaans
sq    =     Albanian
am    =     Amharic        
ar    =     Arabic       
hy    =     Armenian    
az    =     Azerbaijani    
eu    =     Basque       
be    =     Belarusian    
bn    =     Bengali        
bs    =     Bosnian     
bg    =     Bulgarian    
ca    =     Catalan        
ceb    =     Cebuano     
ny    =     Chichewa    
co    =     Corsican       
hr    =     Croatian     
cs    =     Czech    
da    =     Danish         
nl    =     Dutch        
en    =     English    
eo    =     Esperanto      
et    =     Estonian     
tl    =     Filipino    
fi    =     Finnish        
fr    =     French       
fy    =     Frisian    
gl    =     Galician      
ka    =     Georgian     
de    =     German    
el    =     Greek          
gu    =     Gujarati     
ht    =     Haitian Creole    
ha    =     Hausa          
haw    =     Hawaiian    
iw    =     Hebrew   
hi    =     Hindi          
hmn    =     Hmong       
hu    =     Hungarian    
is    =     Icelandic      
ig    =     Igbo         
id    =     Indonesian    
ga    =     Irish          
it    =     Italian      
ja    =     Japanese    
jw    =     Javanese       
kn    =     Kannada      
kk    =     Kazakh    
km    =     Khmer          
ko    =     Korean       
ku    =     Kurdish (Kurmanji)    
ky    =     Kyrgyz         
lo    =     Lao          
la    =     Latin    
lv    =     Latvian        
lt    =     Lithuanian   
lb    =     Luxembourgish    
mk    =     Macedonian     
mg    =     Malagasy     
ms    =     Malay    
ml    =     Malayalam      
mt    =     Maltese      
mi    =     Maori    
mr    =     Marathi        
mn    =     Mongolian    
my    =     Myanmar (Burmese)    
ne    =     Nepali         
no    =     Norwegian    
ps    =     Pashto    
fa    =     Persian        
pl    =     Polish       
pt    =     Portuguese    
pa    =     Punjabi        
ro    =     Romanian     
ru    =     Russian    
sm    =     Samoan         
gd    =     Scots Gaelic 
sr    =     Serbian    
st    =     Sesotho        
sn    =     Shona        
sd    =     Sindhi    
si    =     Sinhala        
sk    =     Slovak       
sl    =     Slovenian    
so    =     Somali         
es    =     Spanish      
su    =     Sundanese    
sw    =     Swahili        
sv    =     Swedish      
tg    =     Tajik    
ta    =     Tamil          
te    =     Telugu       
th    =     Thai    
tr    =     Turkish        
uk    =     Ukrainian    
ur    =     Urdu    
uz    =     Uzbek          
vi    =     Vietnamese   
cy    =     Welsh    
xh    =     Xhosa          
yi    =     Yiddish      
yo    =     Yoruba    
zu    =     Zulu           
zh-cn    =     Chinese Simplified
zh-tw    =     Chinese Traditional`

            return reply(leng)
        }
        
        if(command == 'addG'){
            if(isGroup) return;
            const id = body.split(' ')[1]
            const data = fs.readFileSync('./group.json');
            const parse = JSON.parse(data);
            parse.push({id:id})
            fs.writeFileSync('./group.json', JSON.stringify(parse));
            reply('successfuly')
            client.sendMessage(id, 'Success Grub Di ijinkan', text)
        }
        
        
    } catch (e) {
        console.error(e);
    }
});