const marketplace = require('./contracts_gen.js').marketplace;
const oracle = require('./contracts_gen.js').oracle;
const asdtoken = require('./contracts_gen.js').asdtoken;


var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));

var marketplaceOwner = web3.eth.accounts[1];
var ercc20tokenHolder = web3.eth.accounts[0];

var marketplaceAdr = "0x7f1dc0f5f8dafd9715ea51f6c11b92929b2dbdea";
var Marketplace = web3.eth.contract(marketplace.abi);
var marketplaceInstance = Marketplace.at(marketplaceAdr);
var appleProductId;

marketplaceInstance.createProduct("Apple", 10, 100, {from: marketplaceOwner, gas : 3000000}, (err, result) => {
	if (err) {
		console.log("Something went wrong. Details: " + err)
	} else {
		console.log("New product was created! with ID " + result);
		publishERC20Token();
	}
});

function publishERC20Token () {
	var AsdToken = web3.eth.contract(asdtoken.abi);
	var asdtokenData = {
		"from": ercc20tokenHolder,
		"data": asdtoken.bytecode.object,
		"gas": 4000000
	};

	AsdToken.new(asdtokenData, (err, erc20Instance) => {
		if (!err) {
			if(erc20Instance.address) { //if the contract has an address aka if the transaction is mined
				console.log("New asdtoken address is :", erc20Instance.address);
				buyTokens(erc20Instance);
			}
		} else {
			console.error(err);
		}
	});
}

function buyTokens (erc20Instance) {
	web3.eth.sendTransaction({from: ercc20tokenHolder, to: erc20Instance.address, value: web3.toWei('10', 'ether')}, (err, result) => {
		if (!err) {
			console.log("Successfully bought tokens! For user: " + ercc20tokenHolder);
			checkBalance(erc20Instance);
		} else {
			console.log(err);
		}
	})
}

function checkBalance (erc20Instance) {
	erc20Instance.balanceOf.call(ercc20tokenHolder, {from : web3.eth.accounts[1]}, (err, result) => {
		if (!err) {
			console.log("Balance of buyer:" + result + " ASDTokens. Wohooo!");
			allowMarketplaceToCredit(erc20Instance);
		} else {
			console.log(err);
		}
	})
}

function allowMarketplaceToCredit(erc20Instance) {
	console.log("Allowing marketplaceAdr to credit 100 tokens. adr: " + marketplaceAdr);
	erc20Instance.approve(marketplaceAdr, 1000, {from: ercc20tokenHolder}, (err, result) => {
		if (!err) {
			console.log("User: " + ercc20tokenHolder + " accredited " + marketplaceAdr + " to spend 100 ASDTokens");
			checkMarketplaceAllowance(erc20Instance);
		} else {
			console.log(err);
		}
	})
}

function checkMarketplaceAllowance(erc20Instance) {
	erc20Instance.allowance.call(ercc20tokenHolder, marketplaceAdr, {from: marketplaceAdr}, (err, result) => {
		if (!err) {
			console.log("marketplace has: " + result + " accredited ASDTokens");
		} else {
			console.log(err);
		}
	});
}
