//this function will be called when the whole page is loaded
window.onload = function(){
	if (typeof web3 === 'undefined') {
		//if there is no web3 variable
		displayMessage("Error! Are you sure that you are using metamask?", false);
	} else {
		displayMessage("Successfully connected to Ethereum blockchain!", true);
		init();
	}
}


var contractInstance;
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
"constant": false,
"inputs": [],
"name": "withdrawFunds",
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
"inputs": [
	{
		"name": "_transactionId",
		"type": "bytes32"
	}
],
"name": "__callbackFailure",
"outputs": [],
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
"name": "__callbackSuccess",
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
}
];

var address = "0x42874bcbea7b97551e0bf71f9693775bd005f76b";
var acc;

function init(){
	var Contract = web3.eth.contract(abi);
	contractInstance = Contract.at(address);
	updateAccount();

	loadProductIDs()
}

function updateAccount(){
	//in metamask, the accounts array is of size 1 and only contains the currently selected account. The user can select a different account and so we need to update our account variable
	acc = web3.eth.accounts[0];
}

function displayMessage(message, isSuccess){
	var el = document.getElementById("message");
	el.innerHTML = message;
	el.style.color = isSuccess ? "green" : "red";
}

function handleError(err) {
	console.log("Something went wrong. Details: " + err);
}

function loadProductIDs() {
	contractInstance.getProducts.call((err, result) => {
		if (err) {
			handleError(err);
		} else {
			loadProductsDetails(result);
		}
	});
}

function loadProductsDetails (ids) {
	if (ids.length == 0) {
		displayMessage("There are no contracts to display!", false);
	} else {
		ids.map(id => {
			loadProductDetails(id);
		})
	}
}

function loadProductDetails(id) {
	contractInstance.getProduct.call(id, (err, result) => {
		if (err) {
			handleError(err);
		} else {
			let product = {
				id: id,
				name:result[0],
				price: web3.fromWei(result[1], 'ether').toNumber(),
				quantity: result[2].toNumber()
			};
			displayProduct(product);
		}
	})
}

function displayProduct(product) {
	let table = document.getElementById("productsTable");

	let row = table.insertRow(-1);
	let nameCell = row.insertCell(0);
	nameCell.innerHTML = product.name;
	let priceCell = row.insertCell(1);
	priceCell.innerHTML = product.price;
	let quantityCell = row.insertCell(2);
	quantityCell.innerHTML = product.quantity;
	let buyCell = row.insertCell(3);
	buyCell.style.width="25%";

	let inputTxt = document.createElement("input");
	inputTxt.type = "text";
	inputTxt.placeholder = "Quantity";
	buyCell.appendChild(inputTxt);

	let token = document.createElement("input");
	token.type = "text";
	token.placeholder = "Token";
	buyCell.appendChild(token);

	let btn = document.createElement("input");
	btn.type = "button";
	btn.value = "Buy with ERC20";
	btn.name = "btn";
	btn.onclick = function() {
		executeBuy(product.id, inputTxt.value, token.value);
		inputTxt.value = "";
	};
	btn.style.marginLeft = "15px";
	buyCell.appendChild(btn);
}

function executeBuy(id, quantity, erc20) {
	updateAccount();
	contractInstance.buyWithToken(id, quantity, "ASD", (err, result) => {
		if (err) {
			handleError(err);
		} else {
			console.log(result);
			// contractInstance.buy(id, quantity, {from: acc, value: result}, (err, result) => {
			// 	if (err) {
			// 		handleError(err);
			// 	} else {
			// 		displayMessage("Successfully bought product! Tx hash is: " + result, true);
			// 	}
			// })
		}
	})
}
