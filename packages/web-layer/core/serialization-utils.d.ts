import { WebLayer } from "./WebLayer";
export declare function serializeAttributeValue(value: string): string;
export declare function serializeTextContent(content: string): string;
export declare function serializeAttribute(name: string, value: string): string;
interface Options {
    depth: number;
    target: Node;
    replacer?: (target: Node, node: Node) => string | void;
}
export declare function serializeToString(node: Element, replacer?: Options['replacer']): Promise<string>;
export declare const serializationReplacer: (target: Node, node: Node) => string | undefined;
export declare function getParentsHTML(layer: WebLayer, fullWidth: number, fullHeight: number, pixelRatio: number): string[];
export {};
