import { ServiceException } from "../exceptions/ServiceException";



export class ApiConfigService {

    async getConfig(type: string, docType: string) {
        try {
            const path = `../../../api/configs/${type}/${docType}.config.ts`;
            delete require.cache[require.resolve(path)]
            const imp = await import( /* @vite-ignore */path);
            return imp.config;
        } catch (error) {
            console.error('Error loading config:', error);
            throw new ServiceException(`Error loadingconfig [${type}/${docType}]`);
        }
    }

}