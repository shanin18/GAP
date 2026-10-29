export function remoteImageHosts(env: Record<string, string | undefined>): string[];
export function remoteImagePatterns(hosts: string[]): { protocol: 'https'; hostname: string; pathname?: string }[];
export function isOptimizableImage(src: string, hosts: string[]): boolean;
