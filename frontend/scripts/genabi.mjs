import fs from "node:fs";
import path from "node:path";

// Simple generator: read deployments from ../../contracts/deployments and emit ABI + addresses
const ROOT = path.resolve(process.cwd(), "..", "contracts", "deployments");
const OUT_ABI = path.resolve(process.cwd(), "src", "abi", "EventManagerABI.ts");
const OUT_ADDR = path.resolve(process.cwd(), "src", "abi", "EventManagerAddresses.ts");

function loadDeployment(dir, name) {
  const p = path.join(dir, `${name}.json`);
  if (!fs.existsSync(p)) return undefined;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const networks = fs.existsSync(ROOT) ? fs.readdirSync(ROOT).filter((d)=>!d.startsWith(".")) : [];
const addresses = {};
let abi = null;
for (const net of networks) {
  const dir = path.join(ROOT, net);
  const em = loadDeployment(dir, "EventManagerFHE");
  if (em) {
    // Hardhat-deploy JSON here doesn't include chainId. Infer from folder name.
    let chainId;
    if (em.chainId) chainId = em.chainId;
    else if (net.toLowerCase() === "sepolia") chainId = 11155111;
    else if (net.toLowerCase() === "localhost" || net.toLowerCase() === "hardhat") chainId = 31337;
    else chainId = undefined;

    const key = chainId !== undefined ? String(chainId) : net;
    addresses[key] = { ...(chainId !== undefined && { chainId }), chainName: net, address: em.address };
    abi = em.abi;
  }
}

function sanitizeAbiTypes(a) {
  function walk(item) {
    if (Array.isArray(item)) return item.map(walk);
    if (item && typeof item === 'object') {
      const copy = { ...item };
      if (copy.internalType && /euint/i.test(copy.internalType)) {
        copy.internalType = copy.type; // normalize to bytes32
      }
      if (copy.components) copy.components = copy.components.map(walk);
      if (copy.inputs) copy.inputs = copy.inputs.map(walk);
      if (copy.outputs) copy.outputs = copy.outputs.map(walk);
      return copy;
    }
    return item;
  }
  return a.map(walk);
}

if (abi) {
  const sanitized = sanitizeAbiTypes(abi);
  fs.writeFileSync(OUT_ABI, `export const EventManagerABI = {\n  abi: ${JSON.stringify(sanitized, null, 2)}\n};\n`);
}
fs.writeFileSync(OUT_ADDR, `export const EventManagerAddresses = ${JSON.stringify(addresses, null, 2)} as const;\n`);
console.log("ABI and addresses generated.");


