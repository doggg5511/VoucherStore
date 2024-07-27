const ethers = require('ethers');
const axios = require('axios');

function sleep(seconds) {
    console.log(`Wait ${seconds} seconds`)
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
}


const main = async () => {
    try {
        const relayerWallet = new ethers.Wallet(RELAYER_KEY);
        const relayerSigner = relayerWallet.connect(PROVIDER_URL);
        const httpsProvider = new ethers.providers.JsonRpcProvider({
          url: PROVIDER_URL,
          skipFetchSetup: true
        });


        while(1){
            let jpyPrice = await fetchJpyPrice();
            jpyPrice = parseInt(jpyPrice * 10 ** 8)
            console.log(jpyPrice)
            
            
            let tryNr = 1
            while (tryNr <= 3) {
                try {
                    console.log("[updatePrice] Loading...")
                    const contractInstanceSigner = new ethers.Contract(CONTRACT, CONTRACT_ABI, relayerSigner);
                    const tx = await contractInstanceSigner.updatePrice(jpyPrice, {
                        gasLimit: '300000',
                        type: 2,
                        maxPriorityFeePerGas: "200000000000",
                        maxFeePerGas: "200000000000"
                    });
                    await tx.wait();
                    console.log(`[updatePrice] Success ! Tx hash: ${tx.hash}`)
                    break;
                } catch (e) {
                    tryNr += 1
                    console.log("[ERROR] [updatePrice]")
                    console.error(e)
                    await sleep(5)
                }
            }
        

            await sleep(300);
            
        }
        
    } catch (e) {
        console.log("[ERROR] [main]")
        console.error(e)
    }
}


const fetchJpyPrice = async () => {
    try {
        const {data} = await axios.get('https://corsproxy.xyz/https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=tether&convert=JPY&CMC_PRO_API_KEY=31449c46-239c-478a-8ebf-732898199e0d')
        return 1.0 / (data?.data['825']?.quote?.JPY?.price)
    } catch (e) {
        console.log("[ERROR] [fetchJpyPrice]")
        console.error(e)
    }
};


const getLastPriceData = async () => {
    try {
        const contractInstance = new ethers.Contract(CONTRACT, CONTRACT_ABI, PROVIDER_URL);
        const activeForecasts = await contractInstance.getLastPriceData()
        return activeForecasts
    } catch (e) {
        console.log("[ERROR] [getLastPriceData]")
        console.error(e)
    }
}


const PROVIDER_URL = new ethers.providers.JsonRpcProvider("https://rpc-1.testnet.japanopenchain.org:8545"); 

const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_relayer",
				"type": "address"
			}
		],
		"name": "changeRelayer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_relayer",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "epoch",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "PriceDataUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldRelayer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newRelayer",
				"type": "address"
			}
		],
		"name": "RelayerSet",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "updatePrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLastPriceData",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastUpdated",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "epoch",
						"type": "uint256"
					}
				],
				"internalType": "struct JpyOracle.PriceData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_epochId",
				"type": "uint256"
			}
		],
		"name": "getPriceDataAtEpoch",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastUpdated",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "epoch",
						"type": "uint256"
					}
				],
				"internalType": "struct JpyOracle.PriceData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRelayer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const CONTRACT = '0x469DF70E233Ed22235bD2A24e64C76ad26BC3f63' 

const RELAYER_KEY = 'RELAYER_KEY'   // MetaMask test profile chrome (wallet 2) , 0xe0222b518d2c85bE5Cac51745003a3F45183C04F


console.log(`[${new Date().toISOString()}] Started ...`);

;(async () => {
    await main()
})()



