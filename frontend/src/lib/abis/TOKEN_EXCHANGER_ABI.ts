export const TOKEN_EXCHANGER_ABI = [{
    "inputs": [{"internalType": "address", "name": "_OracleContract", "type": "address"}],
    "name": "changeOracle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "JPYamount", "type": "uint256"}],
    "name": "exchangeJPYtoUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "USDTamount", "type": "uint256"}],
    "name": "exchangeUSDTtoJPY",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "_JPY", "type": "address"}, {
        "internalType": "address",
        "name": "_USDTtoken",
        "type": "address"
    }, {"internalType": "address", "name": "_OracleContract", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "inputs": [{"internalType": "uint256", "name": "JPYamount", "type": "uint256"}],
    "name": "getConvertedAmountJPYtoUSDT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "USDTamount", "type": "uint256"}],
    "name": "getConvertedAmountUSDTtoJPY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "JPYprice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "JPYtoken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "OracleContract",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "USDTtoken",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}]
