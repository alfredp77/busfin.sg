

export class LayoutService {
    private static instance: LayoutService;

    private constructor() {

    }

    static getInstance() {
        if (!LayoutService.instance) {
            LayoutService.instance = new LayoutService();
        }
        return LayoutService.instance;
    }

    async showChildWindow(name: string, url: string, width: number, height: number, resizable: boolean) {
        //@ts-ignore
        return await fin.Window.create({
            name: name,
            url: url,
            defaultWidth: width,
            defaultHeight: height,
            width: width,
            height: height,
            resizable: resizable,
            autoShow: true
        });
    }
}