export interface InterAppRequest {
    Id: string
}

export interface InterAppResponse {
    RequestId: string
    Error: string
}

export interface InterAppRequestHandler {
    initialize():void
}

export class InterApplicationService {
    private static instance: InterApplicationService;

    private constructor() {

    }

    static getInstance() {
        if (!InterApplicationService.instance) {
            InterApplicationService.instance = new InterApplicationService();
        }
        return InterApplicationService.instance;
    }

    async publish<T>(topic:string, message:T) {
        console.log(`Publishing message: ${JSON.stringify(message)}`);
        //@ts-ignore        
        await fin.desktop.InterApplicationBus.publish(topic, message);
    }

    async subscribe<T>(topic:string, callback: (message:T) => void) {
        //@ts-ignore
        await fin.desktop.InterApplicationBus.subscribe("*",topic,
        function (incoming:any, uuid:any) {
            console.log(`There is incoming message: ${JSON.stringify(incoming)}`);
            const message = incoming as T;
            if (message) {
                console.log("Calling the callback")
                callback(message);
            }
        });
    }

    async unsubscribe(topic:string) {
        //@ts-ignore
        await fin.desktop.InterApplicationBus.unsubscribe("*",topic)
    }
}