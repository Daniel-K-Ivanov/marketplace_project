var Ownable = artifacts.require("./Ownable.sol");
var Safemath = artifacts.require("./SafeMath.sol");
var ProductLib = artifacts.require("./ProductLib.sol");
var CooperativeBuyLib = artifacts.require("./CooperativeBuyLib.sol");
var TokenTransactionsLib = artifacts.require("./TokenTransactionsLib.sol");
var Marketplace = artifacts.require("./Marketplace.sol");
var TokenOracle = artifacts.require("./TokenOracle.sol");

module.exports = function(deployer) {
	deployer.deploy(Safemath);
	deployer.link(Safemath, [ProductLib, CooperativeBuyLib, Marketplace]);
	deployer.deploy(ProductLib);
	deployer.link(ProductLib, Marketplace);
	deployer.deploy(CooperativeBuyLib);
	deployer.link(CooperativeBuyLib, Marketplace);
	deployer.deploy(TokenTransactionsLib);
	deployer.link(TokenTransactionsLib, Marketplace);

	deployer.deploy(Ownable);
	deployer.deploy(Marketplace, 5 * 60 * 60 * 24, {from: web3.eth.accounts[1]});
};
