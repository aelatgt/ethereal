export declare function serializeAttribute(name: string, value: string): string;
interface Options {
    depth: number;
    replacer?: (node: Node) => string | void;
}
export declare function serializeToString(node: Element, replacer: Options['replacer']): string;
export {};
