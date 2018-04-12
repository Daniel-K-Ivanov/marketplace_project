pragma solidity 0.4.19;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./ProductLib.sol";
import "./CooperativeBuyLib.sol";
import "./TokenTransactionsLib.sol";
import "./IERC20Token.sol";

/**
* @title Marketplace
* @dev Implemets basic logic for creating, updating and buying products
*/
contract Marketplace is Ownable {

    using CooperativeBuyLib for CooperativeBuyLib.CooperativeBuy;
    using ProductLib for ProductLib.Product;
    using TokenTransactionsLib for TokenTransactionsLib.TokenTransaction;

    using SafeMath for uint;

    mapping(bytes32 => ProductLib.Product) products;
    mapping(bytes32 => CooperativeBuyLib.CooperativeBuy) public coopBuys;
    mapping(bytes32 => uint) pendingQuantityInCoopBuy;

    bytes32[] productIDs;
	mapping (bytes32 => uint) productIDsIndexes;
    uint coopBuyTimeout;

    mapping(bytes32 => TokenTransactionsLib.TokenTransaction) public tokenTransactions;


    modifier productExists (bytes32 _id) {
        require(products[_id].id == _id);
        _;
    }

    modifier checkBuyersLimit (address[] _buyers) {
        require(_buyers.length >= 2);
        require(_buyers.length <= 5);
        _;
    }

    modifier coopBuyExists(bytes32 _id) {
        require(coopBuys[_id].id == _id);
        require(!coopBuys[_id].isFinished);
        _;
    }

    modifier hasNotParticipatedYet(bytes32 _id) {
        require(coopBuys[_id].isParticipant[msg.sender]);
        require(!coopBuys[_id].hasParticipated[msg.sender]);
        _;
    }

    modifier hasNotFailed(bytes32 _id) {
        require(!coopBuys[_id].hasFailed);
        require(coopBuys[_id].timestamp + coopBuyTimeout >= now);
        _;
    }

    modifier hasFailed(bytes32 _coopBuyID) {
        require(coopBuys[_coopBuyID].hasFailed);
        _;
    }

    modifier hasNotRefundedYet(bytes32 _coopBuyID) {
        require(coopBuys[_coopBuyID].isParticipant[msg.sender]);
        require(!coopBuys[_coopBuyID].hasRefunded[msg.sender]);
        _;
    }

    modifier transactionIsPending (bytes32 _id) {
        require(tokenTransactions[_id].isPending);
        _;
    }

    /**
    * Events emitted by OnlyOwner actons
    */
    event ProductCreated(bytes32 indexed itemId);
	event ProductQuantityUpdated(bytes32 indexed itemId, uint oldQuantity, uint newQuantity);
	event ProductRemoval(bytes32 indexed itemId);
	event FundsWithdrawal(address indexed adr, uint amount);
    event FundMarketplace(uint amount);


	event CoopBuyFailed(bytes32 indexed coopBuyId);
    event ProductPurchased(address indexed customerAdr, bytes32 indexed itemId, uint quantity);
	event ProductCoopBuyInitiated(address indexed initialBuyer, bytes32 indexed coopBuyId);
	event ProductCoopBuyUpdated(address indexed buyer, bytes32 indexed coopBuyId, uint amountSent);
	event ProductCoopBuyFinished(bytes32 indexed coopBuyId, bytes32 indexed itemId, uint quantity);
    event RefundCoopBuy(bytes32 indexed coopBuyId, address indexed receiver, uint amount);


    /**
    * Events regarding buying with ERC20 Tokens
    */
    event RequestTokenData(bytes32 indexed transactionId, string symbol);
    event BuyingWithTokenFailed(address indexed buyer, bytes32 indexed itemId, uint quantity);
    event ProductPurchasedWithToken(address indexed customerAdr, bytes32 indexed itemId, uint quantity, string token, uint tokenAmount);

    /**
	* @dev Constructor function. Sets the timeout for cooperative buys
	*/
    function Marketplace(uint _coopBuyTimeout) public {
        coopBuyTimeout = _coopBuyTimeout;
    }

	/**
	* @dev Creates new product with a unique ID. Returns the ID of the created product.
	*/
	function createProduct(string _name, uint _price, uint _quantity) public onlyOwner returns(bytes32) {
		bytes32 ID = generateProductID(_name);

		//Check if product exists with same id;
		assert(products[ID].id != ID);

		ProductLib.Product memory createdProduct = ProductLib.createProduct(ID, _name, _price, _quantity);

		products[ID] = createdProduct;

		uint newIndex = productIDs.length;
		productIDs.push(ID);
		productIDsIndexes[ID] = newIndex;

		ProductCreated(ID);
		return ID;
	}

    /**
    * @dev Only owner. Updates the quantity of a product.
    */
    function update(bytes32 _id, uint _quantity) public onlyOwner productExists(_id) {
        uint currentQuantity = products[_id].quantity;
        products[_id].updateQuantity(_quantity);

        ProductQuantityUpdated(_id, currentQuantity, _quantity);
    }

    /**
    * @dev Only owner. Removes a product by ID.
    */
    function remove(bytes32 _id) public onlyOwner productExists(_id) {
        products[_id] = ProductLib.emptyProduct();
        uint index = productIDsIndexes[_id];
        delete productIDs[index];

        ProductRemoval(_id);
    }

    /**
    * @dev Only owner. The owner marks the CooperativeBuy as failed when an time out occured
    */
    function markCoopBuyAsFailed(bytes32 _id) public onlyOwner coopBuyExists(_id) {
        CooperativeBuyLib.CooperativeBuy storage coopBuy = coopBuys[_id];
        coopBuy.markFailed();
        pendingQuantityInCoopBuy[coopBuy.productId] = pendingQuantityInCoopBuy[coopBuy.productId].sub(coopBuy.quantity);

        CoopBuyFailed(_id);
    }

	/**
	* @dev msg.sender buys certain product by id. Check if the quantity is available, and the correct value is provided.
	*   Reduces the quantity of the product. Emits purchase Event
	*/
	function buy(bytes32 _id, uint _quantity) public payable productExists(_id) {
		ProductLib.Product storage product = products[_id];
		checkQuantity(_quantity, product);

		uint price = product.getPrice(_quantity);
		require(msg.value >= price);

		product.updateQuantity(product.quantity.sub(_quantity));
		ProductPurchased(msg.sender, _id, _quantity);
	}

    /**
	* @dev msg.sender initiates cooperative purchase for a product by id. Checks if the quantity is available.
	* Declares the addresses that will participate in the cooperative purchase INCLUDING THE MSG.SENDER.
	* Marks product as pending, so that there are no errors with the quantity if a regular buy, or coop buy is initiated for the same product
	* Limit of 4 addresses is hardcoded. Therefore the maximum addresses participating in a cooperative purchase is 5.
	*/
    function initCoopBuy(bytes32 _id, uint _quantity, address[] _participants) public productExists(_id) checkBuyersLimit(_participants) returns (bytes32){

        ProductLib.Product storage product = products[_id];
		checkQuantity(_quantity, product);

        bytes32 coopBuyID = generateCoopBuyID(msg.sender, product.id);

        //Check if coopBuy exists with same ID
        assert(coopBuys[coopBuyID].id != coopBuyID);

        coopBuys[coopBuyID] = CooperativeBuyLib.init(coopBuyID, product.id, _quantity, now);
        coopBuys[coopBuyID].populateParticipants(_participants);

        pendingQuantityInCoopBuy[_id] = pendingQuantityInCoopBuy[_id].add(_quantity);
        ProductCoopBuyInitiated(msg.sender, coopBuyID);
		return coopBuyID;
    }

	/**
	* @dev msg.sender buys part of a product by id. Checks if the sent amount is enought for the co-purchase.
	* OVER PAY IS CONSIDERED TIP.
	* If the target value is reached, the coopBuy is marked as finished and the pending and product quantity is reduced
	*/
	function cooperativeBuy(bytes32 _coopBuyID) public payable
	    coopBuyExists(_coopBuyID) hasNotFailed(_coopBuyID) hasNotParticipatedYet(_coopBuyID) {

	    CooperativeBuyLib.CooperativeBuy storage coopBuy = coopBuys[_coopBuyID];
		ProductLib.Product storage product = products[coopBuy.productId];

		//Marks the CooperativeBuy as failed, due to product update or removal
		if (product.quantity < coopBuy.quantity || product.id != coopBuy.productId) {
            coopBuy.markFailed();
            CoopBuyFailed(_coopBuyID);
            return;
		}

		uint price = product.getPrice(coopBuy.quantity);
	    uint eachBuyerPrice = price.div(coopBuy.numberOfParticipants);
		require(msg.value >= eachBuyerPrice);

        coopBuy.buy(eachBuyerPrice);
        ProductCoopBuyUpdated(msg.sender, _coopBuyID, msg.value);

        if (coopBuy.valueSent >= price) {
            coopBuy.markFinished();
            product.updateQuantity(product.quantity.sub(coopBuy.quantity));
            pendingQuantityInCoopBuy[product.id] = pendingQuantityInCoopBuy[product.id].sub(coopBuy.quantity);

            ProductCoopBuyFinished(_coopBuyID, product.id, coopBuy.quantity);
        }
	}

    /**
    * @dev Refunds the msg.sender if he participated in a failed CooperativeBuy
    */
    function refund(bytes32 _coopBuyID) public coopBuyExists(_coopBuyID) hasFailed(_coopBuyID) hasNotRefundedYet(_coopBuyID) {
        CooperativeBuyLib.CooperativeBuy storage coopBuy = coopBuys[_coopBuyID];

        ProductLib.Product storage product = products[coopBuy.productId];
        uint totalPrice = product.getPrice(coopBuy.quantity);
        uint eachBuyerContribution = totalPrice.div(coopBuy.numberOfParticipants);

        coopBuy.markRefund();

        assert(address(this).balance >= eachBuyerContribution);
        msg.sender.transfer(eachBuyerContribution);

        RefundCoopBuy(_coopBuyID, msg.sender, eachBuyerContribution);
    }

    /**
    * @dev Returns the name, price and quantity of a product by id.
    */
    function getProduct(bytes32 id) public view productExists(id) returns(string _name, uint _price, uint _quantity) {
        return (products[id].name, products[id].price, products[id].quantity);
    }

    /**
    * @dev Returns all product IDs.
    */
    function getProducts() public view returns(bytes32[]) {
        return productIDs;
    }

    /**
    * @dev Calculates and retrieves the price for a product by ID and quantity.
    */
    function getPrice(bytes32 _id, uint _quantity) public view productExists(_id) returns (uint) {
        return products[_id].getPrice(_quantity);
    }

    /**
    * @dev Only Owner. Transfers funds from the contract to the owner.
    */
    function withdrawFunds() public onlyOwner {
		uint withdrawnFunds = address(this).balance;
		owner.transfer(withdrawnFunds);
		FundsWithdrawal(owner, withdrawnFunds);
    }

    /**
    * @dev Only Owner. The owner funds the contract with ethers
    */
    function fund() public payable onlyOwner {
        FundMarketplace(msg.value);
    }

    /**
    * @dev Internal helper function. Generates unique Hash used for product IDs.
    */
    function generateProductID(string _name) private view returns (bytes32) {
        uint blockNumber = block.number;
        bytes32 blockHashNow = block.blockhash(blockNumber);
        bytes32 blockHashPrevious = block.blockhash(blockNumber - 1);

        return keccak256(_name, now, blockHashNow, blockHashPrevious);
    }

    /**
    * @dev Internal helper function. Generates unique Hash used for cooperative buy IDs.
    */
    function generateCoopBuyID(address _initialBuyer, bytes32 _productId) private view returns (bytes32) {
        return keccak256(_initialBuyer, _productId, now);
    }

    function generateTranscationId(bytes32 _id, uint _quantity, string _tokenSymbol) private view returns (bytes32) {
        return keccak256(_id, _quantity, _tokenSymbol, msg.sender, now);
    }

    /**
    * @dev internal helper function. Checks if the product has the requested quantity
    */
    function checkQuantity(uint requestedQuantity, ProductLib.Product product) private view {
        require(requestedQuantity != 0);
		require(product.quantity - pendingQuantityInCoopBuy[product.id] >= requestedQuantity);
    }

	/**
    * @dev returns the balance of the contract
    */
	function getBalance() public view returns (uint) {
		return address(this).balance;
	}

	/**
	* @dev returns if the msg.sender is participant in a cooperative buy with specific ID
	*/
	function isParticipantOfCoopBuy(bytes32 _id) public view returns (bool) {
		return coopBuys[_id].isParticipant[msg.sender];
	}

	/**
	* @dev msg.sender buys certain product by id with ERC20 Token.
	* Checks if the quantity is available.
	* Gets the exchange rate of the ERC20/Ether.
	* Claims the ERC20 Token.
	* Reduces the quantity of the product. Emits purchase Event
	*/
	function buyWithToken(bytes32 _id, uint _quantity, string _tokenSymbol) public productExists(_id) {
		ProductLib.Product storage product = products[_id];
		checkQuantity(_quantity, product);

        bytes32 _transactionId = generateTranscationId(_id, _quantity, _tokenSymbol);
        tokenTransactions[_transactionId] = TokenTransactionsLib.initTransaction(_transactionId, msg.sender, _id, _quantity, _tokenSymbol);

        RequestTokenData(_transactionId, _tokenSymbol);
	}

	function callbackSuccess(bytes32 _transactionId, address _tokenAddress, uint _tokenPriceInWei)
	    public onlyOwner transactionIsPending(_transactionId) {

	    TokenTransactionsLib.TokenTransaction storage transaction = tokenTransactions[_transactionId];
	    uint productPriceInWei = products[transaction.productId].getPrice(transaction.quantity);
	    uint productPriceInTokens = productPriceInWei.div(_tokenPriceInWei);

        IERC20Token token = IERC20Token(_tokenAddress);
        //TODO Check for external calls errors
        if (token.transferFrom(transaction.buyer, address(this), productPriceInTokens)) {
            registerTokenPurchase(transaction, productPriceInTokens);
        }
	}

	function registerTokenPurchase(TokenTransactionsLib.TokenTransaction storage _transaction, uint _productPriceInTokens) internal {
	    ProductLib.Product storage product = products[_transaction.productId];

        _transaction.markFinished();
	    product.updateQuantity(product.quantity.sub(_transaction.quantity));
    	ProductPurchasedWithToken(
    	    _transaction.buyer, _transaction.productId, _transaction.quantity, _transaction.tokenSymbol, _productPriceInTokens);
	}

	function callbackFailure(bytes32 _transactionId) public onlyOwner transactionIsPending(_transactionId) {
	    TokenTransactionsLib.TokenTransaction storage transaction = tokenTransactions[_transactionId];

	    transaction.markFinished();
	    BuyingWithTokenFailed(transaction.buyer, transaction.productId, transaction.quantity);
	}
}
