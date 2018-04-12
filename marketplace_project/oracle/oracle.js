var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));

var abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			}
		],
		"name": "buy",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			},
			{
				"name": "_tokenSymbol",
				"type": "string"
			}
		],
		"name": "buyWithToken",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_transactionId",
				"type": "bytes32"
			}
		],
		"name": "callbackFailure",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_transactionId",
				"type": "bytes32"
			},
			{
				"name": "_tokenAddress",
				"type": "address"
			},
			{
				"name": "_tokenPriceInWei",
				"type": "uint256"
			}
		],
		"name": "callbackSuccess",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_coopBuyID",
				"type": "bytes32"
			}
		],
		"name": "cooperativeBuy",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_name",
				"type": "string"
			},
			{
				"name": "_price",
				"type": "uint256"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			}
		],
		"name": "createProduct",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "fund",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "itemId",
				"type": "bytes32"
			}
		],
		"name": "ProductCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "itemId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "oldQuantity",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "newQuantity",
				"type": "uint256"
			}
		],
		"name": "ProductQuantityUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "itemId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "quantity",
				"type": "uint256"
			}
		],
		"name": "BuyingWithTokenFailed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "coopBuyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"name": "receiver",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RefundCoopBuy",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "coopBuyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"name": "itemId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "quantity",
				"type": "uint256"
			}
		],
		"name": "ProductCoopBuyFinished",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "coopBuyId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "amountSent",
				"type": "uint256"
			}
		],
		"name": "ProductCoopBuyUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "initialBuyer",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "coopBuyId",
				"type": "bytes32"
			}
		],
		"name": "ProductCoopBuyInitiated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "transactionId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "symbol",
				"type": "string"
			}
		],
		"name": "RequestTokenData",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "customerAdr",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "itemId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "quantity",
				"type": "uint256"
			}
		],
		"name": "ProductPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "coopBuyId",
				"type": "bytes32"
			}
		],
		"name": "CoopBuyFailed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundMarketplace",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "adr",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundsWithdrawal",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "itemId",
				"type": "bytes32"
			}
		],
		"name": "ProductRemoval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "customerAdr",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "itemId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "quantity",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "token",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "ProductPurchasedWithToken",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			},
			{
				"name": "_participants",
				"type": "address[]"
			}
		],
		"name": "initCoopBuy",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			}
		],
		"name": "markCoopBuyAsFailed",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_coopBuyID",
				"type": "bytes32"
			}
		],
		"name": "refund",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			}
		],
		"name": "remove",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			}
		],
		"name": "update",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "withdrawFunds",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_coopBuyTimeout",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "coopBuys",
		"outputs": [
			{
				"name": "id",
				"type": "bytes32"
			},
			{
				"name": "productId",
				"type": "bytes32"
			},
			{
				"name": "quantity",
				"type": "uint256"
			},
			{
				"name": "numberOfParticipants",
				"type": "uint256"
			},
			{
				"name": "valueSent",
				"type": "uint256"
			},
			{
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"name": "isFinished",
				"type": "bool"
			},
			{
				"name": "hasFailed",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			}
		],
		"name": "getPrice",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "getProduct",
		"outputs": [
			{
				"name": "_name",
				"type": "string"
			},
			{
				"name": "_price",
				"type": "uint256"
			},
			{
				"name": "_quantity",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getProducts",
		"outputs": [
			{
				"name": "",
				"type": "bytes32[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_id",
				"type": "bytes32"
			}
		],
		"name": "isParticipantOfCoopBuy",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "tokenTransactions",
		"outputs": [
			{
				"name": "id",
				"type": "bytes32"
			},
			{
				"name": "buyer",
				"type": "address"
			},
			{
				"name": "productId",
				"type": "bytes32"
			},
			{
				"name": "quantity",
				"type": "uint256"
			},
			{
				"name": "tokenSymbol",
				"type": "string"
			},
			{
				"name": "isPending",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

//MOCK DATA:
var tokens = {
	ASD : {
		priceInWei : 2,
		address : "0xe134eee40a4a313a413e9b1da94bb5d01b79f433"
	}
}

var ownerAdr = web3.eth.accounts[1];
var Marketplace = web3.eth.contract(abi);
var marketplaceInstance = Marketplace.at("0x7f1dc0f5f8dafd9715ea51f6c11b92929b2dbdea");
var requestEvent = marketplaceInstance.RequestTokenData();

requestEvent.watch(function(error, result){
    if (!error) {
		console.log("Received request for data");
		console.log("TransactionId: " + result.args.transactionId + ", symbol: " + result.args.symbol);
		retrieveData(result.args.transactionId, result.args.symbol);
    } else {
        console.log("Error while listening for event: " + error);
    }
});



function retrieveData (transactionId, tokenSymbol) {
	//MOCKED DATA
	var tokenData = tokens[tokenSymbol];
	if (tokenData) {
		marketplaceInstance.callbackSuccess(transactionId, tokenData.address, tokenData.priceInWei, {from: ownerAdr}, (err, result) => {
			if (!err) {
				console.log("Successfuly sent requested data for txId: " + transactionId);
		    } else {
		        console.log("Error while retrieving requested data for txId: " + transactionId);
				console.log(err);
		    }
		});
	} else {
		marketplaceInstance.callbackFailure(transactionId, {from: ownerAdr}, (err, reuslt) => {
			if (!err) {
				console.log("Successfuly called CallBackFailure for txId: " + transactionId);
		    } else {
		        console.log("Error while failing oracle request for txId: " + transactionId);
				console.log(err);
		    }
		});
	}
}
