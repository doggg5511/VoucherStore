// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OracleJPY {
    struct PriceData {
        uint price;
        uint lastUpdated;
        uint epoch;
    }

    address private owner;
    address private relayer;

    PriceData private priceData;
    mapping(uint => PriceData) private priceDataAtEpoch;

    event RelayerSet(address indexed oldRelayer, address indexed newRelayer);
    event PriceDataUpdated(uint indexed epoch, uint indexed price, uint indexed timestamp);

    constructor(address _relayer) {
        owner = msg.sender;
        relayer = _relayer;
        emit RelayerSet(address(0), relayer);
    }

    function getRelayer() public view returns (address) {
        return relayer;
    }

    function getLastPriceData() external view  returns (PriceData memory) {
        return priceData;
    }

    function getPriceDataAtEpoch(uint _epochId) public view returns (PriceData memory) {
        assert(priceDataAtEpoch[_epochId].lastUpdated > 0);
        return priceDataAtEpoch[_epochId];
    }

    function updatePrice(uint _price) public onlyRelayer {
        uint currentEpoch = priceData.epoch;
        priceData.price = _price;
        priceData.lastUpdated = block.timestamp;
        priceData.epoch = currentEpoch + 1;
        priceDataAtEpoch[currentEpoch + 1] = priceData;
        emit PriceDataUpdated(currentEpoch + 1, _price, block.timestamp);
    }

    function changeRelayer(address _relayer) public onlyOwner {
        relayer = _relayer;
        emit RelayerSet(relayer, _relayer);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Caller is not relayer");
        _;
    }
} 