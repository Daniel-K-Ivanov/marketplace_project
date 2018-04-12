const marketplace = require('./contracts_gen.js').marketplace;

var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));

var marketplaceAdr = "0x7f1dc0f5f8dafd9715ea51f6c11b92929b2dbdea";
var Marketplace = web3.eth.contract(marketplace.abi);
var marketplaceInstance = Marketplace.at(marketplaceAdr);

var erc20tokenHolder = web3.eth.accounts[0];

marketplaceInstance.getProducts.call({from: erc20tokenHolder}, (err, result) => {
	if (!err) {
		console.log("Successfuly described products");
		getProductDetails(result[0])
	} else {
		console.log(err);
	}
});

function getProductDetails (productId) {
	marketplaceInstance.getProduct.call(productId, {from: erc20tokenHolder}, (err, result) => {
		if (!err) {
			console.log("Product ID: " + productId + " details: " + result);
			executeBuy(productId);
		} else {
			console.log(err);
		}
	});
}

function executeBuy(productId) {
	marketplaceInstance.buyWithToken(productId, 1, "ASD", {from: erc20tokenHolder, gas : 3000000}, (err, result) => {
		if (!err) {
			console.log("Successfully Executed buy for apple with ASD token");
			executeBuyWithNonCompatibleToken(productId);
		} else {
			console.log(err);
		}
	})
}

function executeBuyWithNonCompatibleToken (productId) {
	marketplaceInstance.buyWithToken(productId, 1, "FALSE", {from: erc20tokenHolder, gas : 3000000}, (err, result) => {
		if (!err) {
			console.log("Successfully Executed buy for apple with ASD token");
		} else {
			console.log(err);
		}
	})
}
