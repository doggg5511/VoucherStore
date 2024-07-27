// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}


interface IOracle {
    struct PriceData {
        uint price;
        uint lastUpdated;
        uint epoch;
    }

    function getLastPriceData() external view returns (PriceData memory);
}


contract TokenExchanger {
    address private owner;

    address public JPYtoken; 
    address public USDTtoken;
    address public OracleContract;
    
    constructor(address _JPY, address _USDTtoken, address _OracleContract) {
        owner = msg.sender;
        JPYtoken = _JPY;
        USDTtoken = _USDTtoken;
        OracleContract = _OracleContract;
    }


    function changeOracle(address _OracleContract) public onlyOwner {
        OracleContract = _OracleContract;
    }

    
    function exchangeJPYtoUSDT(uint256 JPYamount) public { 
        require(JPYamount > 0, "Amount must be greater than zero");
        IERC20(JPYtoken).transferFrom(msg.sender, address(this), JPYamount);
        uint256 convertedAmount = getConvertedAmountJPYtoUSDT(JPYamount);
        IERC20(USDTtoken).transfer(msg.sender, convertedAmount);
    }


    function exchangeUSDTtoJPY(uint256 USDTamount) public { 
        require(USDTamount > 0, "Amount must be greater than zero");
        IERC20(USDTtoken).transferFrom(msg.sender, address(this), USDTamount);
        uint256 convertedAmount = getConvertedAmountUSDTtoJPY(USDTamount);
        IERC20(JPYtoken).transfer(msg.sender, convertedAmount);
    }


    function getConvertedAmountJPYtoUSDT(uint256 JPYamount) public view returns (uint256) {
        uint256 decimalsUSDT = IERC20(USDTtoken).decimals();
        uint256 decimalsJPY = IERC20(JPYtoken).decimals();
        return (JPYamount * JPYprice()) / 10 ** (8 + decimalsJPY - decimalsUSDT);
    }


    function getConvertedAmountUSDTtoJPY(uint256 USDTamount) public view returns (uint256) {
        uint256 decimalsUSDT = IERC20(USDTtoken).decimals();
        uint256 decimalsJPY = IERC20(JPYtoken).decimals();
        return (USDTamount / JPYprice()) * 10 ** (8 + decimalsJPY - decimalsUSDT);
    }


    function JPYprice() public view returns (uint256) {
        return IOracle(OracleContract).getLastPriceData().price;
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }
}
