import { PeopleType } from "../queue/Queue.js";
export * as Queue from "./queue.js";
export * as Users from "./users.js";
export * as Queues from "./queues.js";
export * as User from './user.js';
export * as Login from './login.js';
export function statusGet(req, res) {
    res.status(200).json({});
}
export async function sse(req, res) {
    console.log('Got /events');
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    const data = `data: ${JSON.stringify({ text: "ok" })}\n\n`;
    res.write(data);
    // Tell the client to retry every 10 seconds if connectivity is lost
    res.write('retry: 10000\n\n');
    let count = 0;
    this.a = res;
    req.on('close', () => {
        console.log(`${count} Connection closed`);
        this.a = null;
    });
    // while (count<10) {
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    //     console.log('Emit', ++count);
    //     // Emit an SSE that contains the current 'count' as a string
    //     res.write(`data: ${count}\n\n`);
    // }
}
export function sseSend(req, res) {
    let login = req.body.login;
    this.userManager.notifyUser(login, {
        name: "SSE test",
        config: {
            owner: {
                login: "test",
                type: PeopleType.SITE
            }
        },
        queuedPeople: [
            {
                login: "admin",
                type: PeopleType.SITE,
                frozen: false
            }
        ]
    }, true);
    // if (this.a) {
    //     console.log("Sending")
    //     this.a.write(`data: ${this.counter++}\n\n`);
    // }
    res.json(JSON.stringify(this.a != null));
}
