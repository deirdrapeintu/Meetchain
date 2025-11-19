# MeetChain (action)

- contracts: Hardhat + FHEVM (mock/local, relayer-sdk/Sepolia)
- frontend: Next.js + Tailwind，前端直连 FHEVM（本地 mock / 测试网 relayer-sdk）

## 环境变量

contracts/.env

```
PRIVATE_KEY=
ETHERSCAN_API_KEY=
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

frontend/.env.local

```
NEXT_PUBLIC_PINATA_JWT=
```

## 本地开发（Mock）

1) 启动 Hardhat 本地链（含 FHEVM Hardhat 节点）
2) 部署合约
```
cd action/contracts
npm i
npm run deploy:localhost
```
3) 生成 ABI/地址到前端
```
cd ../frontend
npm i
npm run gen:abi
npm run dev
```
- 前端将自动检测 31337，创建 MockFhevmInstance，与合约进行加密输入与解密

## 测试网（Sepolia + relayer-sdk）

1) 配置合约环境变量（你提供的数据）：
- 钱包地址: 0xd3694b057dAbD2a7C59390d61575d2B7d103ddf0
- PRIVATE_KEY: fdb0b3c5e223fd6a138bb0fc5e9c5182d4fc28274e31cdfa5bc6298a41190116
- ETHERSCAN_API_KEY: QB3VMXRZRJ3WVAJ5ASH9823B9VHFBCVV3Y
- SEPOLIA_RPC_URL: https://ethereum-sepolia-rpc.publicnode.com

2) 部署 + 验证
```
cd action/contracts
npm run deploy:sepolia
npm run verify:sepolia
```
3) 生成 ABI/地址到前端并运行
```
cd ../frontend
npm run gen:abi
npm run dev
```
- 前端会加载 relayer-sdk（CDN），创建 FhevmInstance，与合约进行加密输入与解密

## 使用说明
- Organizer 在前端“创建活动”上传元数据到 IPFS（Pinata），上链 `createEvent`。
- Attendee 扫码进入活动页面，点击“签到”发起加密输入（值=1）的写操作，合约通过 FHE 从外部密文入参累加密文计数；解密按钮可在 organizer/attendee 侧解密句柄，查看人数（演示用途）。

## 注意
- 生产环境不建议在浏览器直接暴露 Pinata token，建议接入后端中转。
- FHEVM 解密签名缓存在浏览器内存存储（示例实现）。


