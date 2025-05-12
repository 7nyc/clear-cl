const {
    token,
    trigger
} = require('./config.json')

const request = require("request");
const colors = require('colors')
const {
    Client
} = require('discordjs-selfv11')
const rpc = require('discord-rpc')

const client = new Client(),
    rpcClient = new rpc.Client({
        transport: 'ipc'
    })

process.on('unhandledRejection', e => {})
process.on('uncaughtException', e => {})
process.on('uncaughtRejection', e => {})
process.warn = () => {};

client.on("error", () => {})

client.on("warn", () => {})

function printClear() {
    console.log(`

 
    ██████╗ ██████╗  ██████╗ ███╗   ███╗██████╗ ███████╗
    ██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚════██║
    ██████╔╝██████╔╝██║   ██║██╔████╔██║██████╔╝   ██╔╝ 
    ██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔═══╝   ██╔╝  
    ██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║       ██║   
    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝       ╚═╝ 
    
                                                                            
    • ${client.user.tag} | Type: '${trigger}' on any chat. •
    `.blue)
}

console.clear()
process.title = `fxck - Loading...`
console.log(`




    ██╗      ██████╗  █████╗ ██████╗ ██╗███╗   ██╗ ██████╗          
    ██║     ██╔═══██╗██╔══██╗██╔══██╗██║████╗  ██║██╔════╝          
    ██║     ██║   ██║███████║██║  ██║██║██╔██╗ ██║██║  ███╗         
    ██║     ██║   ██║██╔══██║██║  ██║██║██║╚██╗██║██║   ██║         
    ███████╗╚██████╔╝██║  ██║██████╔╝██║██║ ╚████║╚██████╔╝██╗██╗██╗
    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝╚═╝
                                                                `.blue)

function clear(authToken, authorId, channelId) {
    const wait = async (ms) => new Promise(done => setTimeout(done, ms))

    const headers = {
        "Authorization": authToken
    };

    const recurse = (before) => {
        let params = before ? `?before=${before}` : ``;

        request({
            url: `https://discord.com/api/v9/channels/${channelId}/messages${params}`,
            headers: headers,
            json: true
        }, async (error, response, result) => {
            if (response === undefined) {
                return recurse(before);
            }

            if (response.statusCode === 202) {
                const w = response.retry_after;

                console.log(`Ops, canal não indexado, aguarde ${w}ms para indexar as mensagens.`);

                await wait(w);

                return recurse(before);
            }

            if (response.statusCode !== 200) {
                return console.log('Aguardando API!', result);
            }

            for (let i in result) {
                let message = result[i];

                if (message.author.id === authorId && message.type !== 3) {
                    await new Promise((resolve) => {

                        const deleteRecurse = () => {
                            request.delete({
                                url: `https://discord.com/api/v9/channels/${channelId}/messages/${message.id}`,
                                headers: headers,
                                json: true
                            }, async (error, response, result) => {
                                if (error) {
                                    return deleteRecurse();
                                }
                                if (result) {
                                    if (result.retry_after !== undefined) {
                                        console.log(`Rate-limited! Waiting ${result.retry_after}ms to continue the purge.`)
                                        await wait(result.retry_after * 3000);
                                        return deleteRecurse();
                                    }
                                }

                                resolve()
                            });
                        }

                        deleteRecurse();
                    });
                }
            }

            if (result.length === 0) {
                console.clear()
                printClear()
                console.log("pronto, mensagens limpas");
            } else {
                recurse(result[result.length - 1].id);
            }
        });
    }

    recurse();
}

client.on('ready', async () => {
    console.clear()
    process.title = `fxck | Connected in: ${client.user.username}`
    printClear()
})

client.on('message', async (message) => {
    if (message.author.id != client.user.id) return
    if (message.content.toLowerCase() === trigger) {
        message.delete()
        clear(token, client.user.id, message.channel.id);
        console.log(`gatilho detectado - Iniciando Processo de Limpeza....`)
    }
})

client.on('warn', () => {})
client.on('error', () => {})

client.login(token)