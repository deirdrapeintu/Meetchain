export function buildIpfsGatewayUrl(cid: string): string {
  const gw = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
  const base = gw.replace(/\/+$/, "");
  return `${base}/${cid}`;
}


