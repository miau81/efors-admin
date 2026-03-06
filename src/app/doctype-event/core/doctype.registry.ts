export type DocTypeLoader = () => Promise<any>;

export class DocTypeRegistry {
  private static loaders = new Map<string, DocTypeLoader>();

  static register(id: string, loader: DocTypeLoader) {
    this.loaders.set(id, loader);
  }

  static async get(id: string): Promise<any> {
    const loader = this.loaders.get(id);
    if (!loader) throw new Error(`DocType ${id} not found`);
    
    const module = await loader();
    
    return  module.default;
  }
}