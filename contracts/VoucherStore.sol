// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


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


contract VoucherStore is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    // Struct to store store information
    struct Store {
        uint256 id;
        address owner;
        string name;
        string ipfsHash;
    }
    
    // Struct to store voucher pack information
    struct VoucherPack {
        uint256 id;
        uint256 storeId;
        string name;
        uint256 price;
        string coin;
        uint256 expirationTimestamp;
        uint256 maxSupply;
        uint256 totalSoldCount;
        bool acceptOtherCoin;
        string ipfsHash; 
        string[] encryptedCodes; 
        uint256 nextCodeIndex;
    }

    // Struct to store individual voucher information
    struct Voucher {
        uint256 id;
        uint256 storeId;
        uint256 packId;
        bool isSold;
        bool isBurned;
        string ipfsHash;
        string code;
        uint256 expirationTimestamp;
    }

    
    address public OracleContract;
    

    // Mapping from store ID to Store
    mapping(uint256 => Store) public stores;
    // Mapping from store ID to mapping of voucher pack ID to VoucherPack
    mapping(uint256 => mapping(uint256 => VoucherPack)) public voucherPacks;
    // Mapping from store ID to count of voucher packs
    mapping(uint256 => uint256) public voucherPackCount;
    // Mapping from global voucher ID to Voucher
    mapping(uint256 => Voucher) public vouchers;
    // Mapping from ERC721 token ID to IPFS hash
    mapping(uint256 => string) private _tokenURIs;
    // Mapping from coin name to ERC20 token address
    mapping(string => address) public acceptedTokens;
    // Mapping from user address to an array of burned voucher IDs
    mapping(address => uint256[]) public burnedVouchers;
    // Global counter for voucher IDs
    uint256 public voucherIdCounter;
    // Counter for store IDs
    uint256 public storeIdCounter;
    // Counter for voucher pack IDs
    uint256 public voucherPackIdCounter;
    // Global counter for ERC721 token IDs
    uint256 public tokenIdCounter;

    // Event when a store is created
    event StoreCreated(uint256 storeId, address owner, string name);
    // Event when a voucher pack is created
    event VoucherPackCreated(
        uint256 storeId, 
        uint256 packId, 
        string name,
        uint256 price, 
        string coin, 
        uint256 expirationTimestamp, 
        uint256 maxSupply, 
        bool acceptOtherCoin, 
        string ipfsHash, 
        string[] encryptedCodes
    );
    // Event when a voucher is created and purchased
    event VoucherCreatedAndPurchased(uint256 storeId, uint256 packId, uint256 voucherId, uint256 tokenId, string ipfsHash, string code, address buyer);
    // Event when a voucher is burned
    event VoucherBurned(uint256 voucherId, uint256 tokenId);

    constructor(
        address initialOwner,
        address _OracleContract
    )   ERC721("VoucherStore", "VOUCHER")
        Ownable(initialOwner)
    {
        OracleContract = _OracleContract;
    }



    // Function to create a store
    function createStore(
        string calldata name,
        string calldata ipfsHash
    ) external {
        uint256 newStoreId = storeIdCounter++;
        stores[newStoreId] = Store({
            id: newStoreId,
            owner: msg.sender,
            name: name,
            ipfsHash: ipfsHash
        });

        emit StoreCreated(newStoreId, msg.sender, name);
    }

    // Function to create a voucher pack
    function createVoucherPack(
        uint256 storeId,
        string memory name,
        uint256 price, 
        string calldata coin, 
        uint256 expirationTimestamp, 
        uint256 maxSupply,
        bool acceptOtherCoin,
        string calldata ipfsHash,
        string[] memory encryptedCodes
    ) external {
        require(stores[storeId].owner == msg.sender, "Only the store owner can create voucher packs");
        require(encryptedCodes.length == maxSupply, "The number of codes must match the max supply");

        uint256 newPackIndex = voucherPackCount[storeId]++;
        uint256 newPackId = voucherPackIdCounter++;

        voucherPacks[storeId][newPackIndex] = VoucherPack({
            id: newPackId,
            storeId: storeId,
            name: name, 
            price: price,
            coin: coin,
            expirationTimestamp: expirationTimestamp,
            maxSupply: maxSupply,
            totalSoldCount: 0,
            acceptOtherCoin: acceptOtherCoin,
            ipfsHash: ipfsHash,
            encryptedCodes: encryptedCodes,
            nextCodeIndex: 0 
        });


        emit VoucherPackCreated(storeId, newPackId, name, price, coin, expirationTimestamp, maxSupply, acceptOtherCoin, ipfsHash, encryptedCodes);
    }


    function changeOracle(address _OracleContract) external onlyOwner {
        OracleContract = _OracleContract;
    }
    

    // Function to set or update the accepted ERC20 token address
    function setAcceptedToken(string calldata coin, address tokenAddress) external onlyOwner {
        acceptedTokens[coin] = tokenAddress;
    }



    function getConvertedAmountJPYtoUSDT(address USDTtoken, address JPYtoken, uint256 JPYamount) public view returns (uint256) {
        uint256 decimalsUSDT = IERC20(USDTtoken).decimals();
        uint256 decimalsJPY = IERC20(JPYtoken).decimals();
        return (JPYamount * JPYprice()) / 10 ** (8 + decimalsJPY - decimalsUSDT);
    }


    function getConvertedAmountUSDTtoJPY(address USDTtoken, address JPYtoken, uint256 USDTamount) public view returns (uint256) {
        uint256 decimalsUSDT = IERC20(USDTtoken).decimals();
        uint256 decimalsJPY = IERC20(JPYtoken).decimals();
        return (USDTamount / JPYprice()) * 10 ** (8 + decimalsJPY - decimalsUSDT);
    }


    function JPYprice() public view returns (uint256) {
        return IOracle(OracleContract).getLastPriceData().price;
    }

    
    // Function to purchase a voucher and create it if it doesn't exist
    function purchaseVoucher(
        uint256 storeId, 
        uint256 packIndexInStore, 
        address paymentTokenAddress
    ) external {
        VoucherPack storage pack = voucherPacks[storeId][packIndexInStore];
        require(pack.price > 0, "Voucher pack does not exist");
        require(pack.expirationTimestamp > block.timestamp, "Voucher pack has expired");
        require(pack.totalSoldCount < pack.maxSupply, "Voucher pack supply exhausted");

        uint256 price = pack.price;
        // Check if payment is in the accepted ERC20 token or if other tokens are accepted
        if (pack.acceptOtherCoin) {
            require(paymentTokenAddress != address(0), "ERC20 token address is zero");
            require(paymentTokenAddress == acceptedTokens[pack.coin] || paymentTokenAddress == acceptedTokens["JPY"] || paymentTokenAddress == acceptedTokens["USDT"], "ERC20 token is not accepted for this voucher pack");

            if (paymentTokenAddress != acceptedTokens[pack.coin]) {
                if (keccak256(abi.encodePacked("JPY")) == keccak256(abi.encodePacked(pack.coin))) {
                    price = getConvertedAmountJPYtoUSDT(acceptedTokens["USDT"], acceptedTokens["JPY"], pack.price);
                }
                else if (keccak256(abi.encodePacked("USDT")) == keccak256(abi.encodePacked(pack.coin))) {
                    price = getConvertedAmountUSDTtoJPY(acceptedTokens["USDT"], acceptedTokens["JPY"], pack.price);
                }
            }
        } else {
            require(paymentTokenAddress != address(0), "ERC20 token address is zero");
            require(paymentTokenAddress == acceptedTokens[pack.coin], "ERC20 token is not accepted for this voucher pack");
        }

        address storeOwner = stores[storeId].owner;

        IERC20 token = IERC20(paymentTokenAddress);
        require(token.transferFrom(msg.sender, storeOwner, price), "ERC20 token transfer failed");

        // Generate a unique voucher ID using the global counter
        uint256 voucherId = voucherIdCounter++;
        
        // Generate a unique token ID for ERC721 using the global counter
        uint256 tokenId = tokenIdCounter++;
        
        // Get the next code and update the index
        string memory code = pack.encryptedCodes[pack.nextCodeIndex];
        pack.nextCodeIndex++;
        
        // Create or update the voucher
        vouchers[voucherId] = Voucher({
            id: voucherId,
            storeId: storeId,
            packId: pack.id,
            isSold: true,
            isBurned: false, // Initially not burned
            ipfsHash: pack.ipfsHash, // Inherit the IPFS hash from the voucher pack
            code: code, // Assign the code to the voucher
            expirationTimestamp: pack.expirationTimestamp
        });

        // Mint the ERC721 token and set its metadata URI
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, pack.ipfsHash);

        // Update total sold count
        pack.totalSoldCount++;

        emit VoucherCreatedAndPurchased(storeId, pack.id, voucherId, tokenId, pack.ipfsHash, code, msg.sender);
    }


    // Function to burn a voucher (ERC721 token) and update the Voucher struct
    function burnVoucher(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "ERC721: caller is not the owner");

        uint256 voucherId = _getVoucherIdByTokenId(tokenId);
        require(!vouchers[voucherId].isBurned, "Voucher is already burned");

        // Set the voucher as burned
        vouchers[voucherId].isBurned = true;

        // Burn the ERC721 token
        _burn(tokenId);

        // Record the burned voucher for the user
        burnedVouchers[msg.sender].push(voucherId);

        emit VoucherBurned(voucherId, tokenId);
    }

    // Retrieve the voucher ID associated with a token ID
    function _getVoucherIdByTokenId(uint256 tokenId) internal view returns (uint256) {
        for (uint256 i = 0; i < voucherIdCounter; i++) {
            if (vouchers[i].id == tokenId) {
                return vouchers[i].id;
            }
        }
        revert("Voucher not found for the given token ID");
    }


    // Function to retrieve burned vouchers for a user
    function getBurnedVouchers(address user) external view returns (uint256[] memory) {
        return burnedVouchers[user];
    }



    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Function to get store information
    function getStore(uint256 storeId) external view returns (address owner, string memory name) {
        Store memory store = stores[storeId];
        return (store.owner, store.name);
    }

    // Function to get voucher pack information
    function getVoucherPack(uint256 storeId, uint256 packId) external view returns (
        uint256 id, 
        uint256 _storeId, 
        string memory name
    ) {
        VoucherPack memory pack = voucherPacks[storeId][packId];
        return (
            pack.id, 
            pack.storeId, 
            pack.name
        );
    }


    
    function getVoucherPackCodes(uint256 storeId, uint256 packId) external view returns (
        string[] memory encryptedCodes
    ) {
        VoucherPack memory pack = voucherPacks[storeId][packId];
        return (
           pack.encryptedCodes
        );
    }



    // Function to get individual voucher information
    function getVoucher(uint256 voucherId) external view returns (
        uint256 id, 
        uint256 storeId, 
        uint256 packId, 
        bool isSold,
        bool isBurned,
        string memory ipfsHash
    ) {
        Voucher memory voucher = vouchers[voucherId];
        return (
            voucher.id, 
            voucher.storeId, 
            voucher.packId, 
            voucher.isSold,
            voucher.isBurned,
            voucher.ipfsHash
        );
    }
}
