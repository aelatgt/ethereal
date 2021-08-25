export declare function serializeAttributeValue(value: string): string;
export declare function serializeTextContent(content: string): string;
export declare function serializeAttribute(name: string, value: string): string;
interface Options {
    depth: number;
    replacer?: (node: Node) => string | void;
}
export declare function serializeToString(node: Element, replacer: Options['replacer']): Promise<string>;
export {};
