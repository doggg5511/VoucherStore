# VoucherStore

----------


| Contract name    | Contract address | chain | Explorer |
| -------- | ------- |  ------- | ------- |
| JPY  | 0x81a96A35C8c317D9226378e8A41DBf259fdF5b50  | JOC Testnet  | https://explorer.testnet.japanopenchain.org/address/0x81a96A35C8c317D9226378e8A41DBf259fdF5b50    |
| OFTAdapter_JPY  | 0x68c49DF8cC981eBE4aCf6E41554095b465844586  | JOC Testnet  | https://explorer.testnet.japanopenchain.org/address/0x68c49DF8cC981eBE4aCf6E41554095b465844586    |
| USDT  | 0xB2627431cF8752dB5B9B9c91DFAd461D071a4B1C  | JOC Testnet  | https://explorer.testnet.japanopenchain.org/address/0xB2627431cF8752dB5B9B9c91DFAd461D071a4B1C    |
| Oracle  | 0x469DF70E233Ed22235bD2A24e64C76ad26BC3f63  | JOC Testnet  | https://explorer.testnet.japanopenchain.org/address/0x469DF70E233Ed22235bD2A24e64C76ad26BC3f63    |
| TokenExchanger  | 0x94C86132C046f658A08686F44C23A17cba58aEE2  | JOC Testnet  | https://explorer.testnet.japanopenchain.org/address/0x94C86132C046f658A08686F44C23A17cba58aEE2    |
| VoucherStore  | 0x1cb6EB6Fd6984fC1feC0C5bE4d254CcbFF6D721F  | JOC Testnet  | https://explorer.testnet.japanopenchain.org/address/0x1cb6EB6Fd6984fC1feC0C5bE4d254CcbFF6D721F    |
| OFT_JPY  | 0x5197e45718b985592f3e8266c3281a463eed7f65  | Arbitrum Sepolia  | https://sepolia.arbiscan.io/address/0x5197e45718b985592f3e8266c3281a463eed7f65    |

----------

### What it does

VoucherStore is a Web3 decentralized application (dApp) designed to enhance the utility of Japanese Yen (JPY) stablecoins. It provides a versatile platform for users to:

- Explore and purchase vouchers: Browse various stores, buy discount voucher packs, and choose payment options in JPY or USDT.
- Manage vouchers securely: View, transfer, or burn vouchers, with secure mechanisms for revealing voucher codes through signature verification.
- Claim free tokens: Utilize a faucet section to obtain free JPY and USDT tokens.
- Swap tokens: Convert JPY to USDT and vice versa with accurate rates provided by an Oracle smart contract.
- Bridge tokens across chains: Transfer JPY tokens between the Japan Open Chain and Arbitrum using LayerZero technology and Omni Fungible Token (OFT) standard.


----------

### The problem it solves

VoucherStore addresses several key issues:

- Limited use cases for stablecoins: Expands the practical applications of Japanese Yen stablecoins beyond simple transactions by integrating them into a dynamic discount voucher marketplace.
- Complex currency management: Simplifies the process of managing and using multiple currencies (JPY and USDT) with real-time exchange rate conversions.
- Secure voucher redemption: Provides a secure method for redeeming voucher codes through verified signatures, ensuring the integrity and privacy of voucher information.
- Cross-chain compatibility: Facilitates seamless transfer of JPY tokens across different blockchain networks, enhancing the token’s usability and reach.

----------

### Goals

VoucherVault aims to achieve the following goals:

- Expand stablecoin use cases: Utilize Japanese Yen (JPY) stablecoins to facilitate a versatile discount voucher marketplace, promoting practical applications of stablecoins beyond simple transactions.
- Promote Web3 Adoption: Showcase the benefits of Japanese Yen stablecoins in everyday transactions and interactions, encouraging broader adoption of web3 technologies.

----------

### Challenges I ran into
- Real-time exchange rates: Integrating accurate real-time exchange rates between JPY and USDT required reliable Oracle smart contracts and careful handling of conversion processes.
- Secure voucher code redemption: Ensuring the security and privacy of voucher code retrieval through signature verification posed challenges in implementing secure backend processes.
- Cross-chain bridging: Developing a seamless bridge for JPY tokens between the Japan Open Chain and Arbitrum involved using advanced technologies like LayerZero, which required overcoming technical complexities.
- User experience design: Creating an intuitive and user-friendly interface while integrating complex functionalities demanded careful design and iterative testing.

----------

### Technologies I used
- Blockchain and smart Contracts: Utilized Ethereum-based smart contracts for managing voucher transactions, employing the ERC721 standard from OpenZeppelin for creating and handling NFTs.
- Oracles: Integrated Oracle smart contracts to fetch real-time exchange rates between Japanese Yen (JPY) and USDT, ensuring accurate currency conversions.
- Cross-chain technology: Implemented LayerZero for bridging JPY tokens between Japan Open Chain and Arbitrum, using Omni Fungible Token (OFT) standard for cross-chain transfers.
- Token standards: Utilized ERC20 for stablecoin transactions and ERC721 for NFT vouchers, ensuring robust and scalable token management.
- Web3 libraries: Leveraged web3 libraries for connecting the blockchain functionalities with the dApp’s front-end interface, providing a seamless user experience.
- IPFS (InterPlanetary File System): used for storing voucher metadata, such as titles, images, and descriptions. This decentralized storage solution ensures that voucher information is immutable and accessible across the network, enhancing data security and reliability.

----------

### How I built it
- Design and Planning: Defined the core features and architecture of the dApp, including voucher management, multi-currency support, and cross-chain bridging.
- Smart Contract Development: Developed and deployed smart contracts for voucher management, token standards, and integration with Oracle services.
- Front-End Development: Built a user-friendly interface for exploring, purchasing, and managing vouchers, incorporating secure methods for code redemption.
- Back-End Integration: Implemented backend services for verifying voucher codes, set up cron tasks to periodically fetch and store the Japanese Yen (JPY) price in the Oracle smart contract, ensuring up-to-date exchange rates.

---------

### What I learned
- Stablecoin integration: Gained insights into extending the use of stablecoins beyond basic transactions, exploring practical applications in real-world scenarios.
- Security practices: Deepened understanding of secure transaction practices, particularly in voucher code redemption and signature verification.
- Cross-chain technology: Learned about the complexities and benefits of cross-chain interoperability, using LayerZero for seamless token transfers.


----------

### What's next for
- Explore additional features such as advanced analytics for store owners, loyalty programs, etc.
- Focus on increasing user engagement and adoption by marketing the dApp and expanding its reach within the web3 and traditional retail sectors.
- Continue to refine and expand cross-chain capabilities, potentially integrating with more blockchain networks and technologies.
