var Marketplace = artifacts.require("Marketplace");
const Events = require('./utils').Events;
const findEventAndGetArguments = require('./utils').findEventAndGetArguments;
const executeAndExpectThrow = require('./utils').executeAndExpectThrow;
const assertProductsEqual = require('./utils').assertProductsEqual;

contract('Marketplace', async (accounts) => {

	let marketplace;
	const owner = accounts[0];
	const acc1 = accounts[1];
	const acc2 = accounts[1];

	//Prodcuts MOCK [START]
	const basicProduct = { name: "basicProduct", price : 15000, quantity: 15};
	const expensiveProduct = {name: "expensiveProduct", price : web3.toWei("1", "ether"), quantity: 150}
	const zeroPriceProduct = {name: "zeroPriceProduct", price : 0, quantity: 15 };
	const emptyNameProduct = {name : "", price : 1000, quantity : 1 };
	const zeroQuantityProduct = {name : "zeroQuantityProduct", price : 1200, quantity : 0};
	//Prodcuts MOCK [END]

	//Events MOCK [START]
	const productCreated = "ProductCreated";
	const productPurchased = "ProductPurchased";
	const productUpdated = "ProductQuantityUpdated";
	const ownershipTransferred = "OwnershipTransferred";
	const fundsWithdrawal = "FundsWithdrawal";
	const fundMarketplace = "FundMarketplace";
	const productCoopBuyInitiated = "ProductCoopBuyInitiated";
	const coopBuyFailed = "CoopBuyFailed";
	const productRemoval = "ProductRemoval";
	const refundCoopBuy = "RefundCoopBuy";
	//Events MOCK [END]

	/**
	*	Contract Util functions [START]
	*/
	async function createProduct(product, sender) {
		let productTx = await marketplace.createProduct(product.name, product.price, product.quantity, {from : sender});
		let eventArgs = findEventAndGetArguments(productTx, productCreated);
		assert(eventArgs.itemId, "An event argument itemId was expected, but not found");
		return eventArgs.itemId;
	}

	async function createCoopBuy(productId, amount, buyers, sender) {
		let coopBuyTx = await marketplace.initCoopBuy(productId, amount, buyers, {from: sender});
		let eventArgs = findEventAndGetArguments(coopBuyTx, productCoopBuyInitiated);
		assert(eventArgs.coopBuyId, "An event argument coopBuyId was expected, but not found");
		return eventArgs.coopBuyId;
	}

	async function getCoopBuyByID (id, sender) {
		let coopBuy = await marketplace.coopBuys.call(id, {from: acc1});
		return {
			id: coopBuy[0],
			productId : coopBuy[1],
			quantity: coopBuy[2],
			numberOfParticipants : coopBuy[3],
			valueSent : coopBuy[4],
			timestamp : coopBuy[5],
			isFinished : coopBuy[6],
			isFailed : coopBuy[7]
		};
	}

	async function createAndGetCoopBuy(productId, amount, buyers, sender) {
		let coopBuyId = await createCoopBuy(productId, amount, buyers, sender);
		return await getCoopBuyByID(coopBuyId, sender);
	}

	async function createProductNegative(product, sender) {
		await marketplace.createProduct(product.name, product.price, product.quantity, {from : sender});
	}

	/**
	*	Contract Util functions [END]
	*/

	describe("Test Owner logic", () => {
		beforeEach(async () => {
			marketplace = await Marketplace.new(owner);
		})

		it("Check owner after deploy", async () => {
			let _owner = await marketplace.owner.call();
			assert(_owner == owner);
		})

		it("Withdraw funds with owner", async () => {
			let withdrawTx = await marketplace.withdrawFunds();
			let adr = findEventAndGetArguments(withdrawTx, fundsWithdrawal).adr;
			assert(adr == owner, "Addresses do not match, after withdraw tx");
		})

		it("[Negative] Withdraw funds with non-owner", async () => {
			await executeAndExpectThrow(async () => {await marketplace.withdrawFunds({from: accounts[1]})});
		})
	});

	describe("Test Products Logic", () => {

		beforeEach(async () => {
			marketplace = await Marketplace.new(accounts[0]);
		})

		it("[Negative] Get non-existing product", async () => {
			await executeAndExpectThrow(async () => {await marketplace.getProduct.call("fakeID")});
		})

		it("Create product", async () => {
			let basicProductId = await createProduct(basicProduct, accounts[0]);
			let createdProduct = await marketplace.getProduct.call(basicProductId);
			await assertProductsEqual(basicProduct, createdProduct);
		})

		it("Create product with zero quantity", async () => {
			let zeroQuantityProductId = await createProduct(zeroQuantityProduct, accounts[0]);
			let createdProduct = await marketplace.getProduct.call(zeroQuantityProductId);
			await assertProductsEqual(zeroQuantityProduct, createdProduct);
		})

		it("[Negative] Create product with non-owner", async () => {
			await executeAndExpectThrow(async () => {await createProductNegative(basicProduct, accounts[1])});
		})

		it("[Negative] Create product with empty name", async () => {
			await executeAndExpectThrow(async () => {await createProductNegative(emptyNameProduct, accounts[0])});
		})

		it("[Negative] Create product with zero price", async () => {
			await executeAndExpectThrow(async () => {await createProductNegative(zeroPriceProduct, accounts[0])});
		})

		it("Change ownership, and create product with new owner", async () => {
			let changeOwnershipTx = await marketplace.transferOwnership(accounts[1]);
			let newOwnerAddr = findEventAndGetArguments(changeOwnershipTx, ownershipTransferred).newOwner;
			assert(newOwnerAddr == accounts[1], "Owners do not match after transfer of ownership");

			let productId = await createProduct(basicProduct, accounts[1]);
			let createdProduct = await marketplace.getProduct.call(productId);
			await assertProductsEqual(basicProduct, createdProduct);
		})

		it("[Negative] Change ownership, and create product with old owner", async () => {
			let changeOwnershipTx = await marketplace.transferOwnership(accounts[2]);
			let newOwnerAddr = findEventAndGetArguments(changeOwnershipTx, ownershipTransferred).newOwner;
			assert(newOwnerAddr == accounts[2], "Owners do not match after transfer of ownership");

			await executeAndExpectThrow(async () => {await createProductNegative(basicProduct, accounts[1])});
		})

		it("Check all created product IDs", async () => {
			let product1Id = await createProduct(basicProduct, accounts[0]);
			let ids = await marketplace.getProducts.call();
			assert(ids.length == 1, "Number of product ids should be 1");
			assert(ids[0] == product1Id, "Product Ids should match");

			let product2Id = await createProduct(zeroQuantityProduct, accounts[0]);
			ids = await marketplace.getProducts.call();
			assert(ids.length == 2, "Number of product ids should be 2");
			assert(ids[1] == product2Id, "Product Ids should match");

			let product3Id = await createProduct(basicProduct, accounts[0]);
			ids = await marketplace.getProducts.call();
			assert(ids.length == 3, "Number of product ids should be 3");
			assert(ids[2] == product3Id, "Product Ids should match");

			let product4Id = await createProduct(zeroQuantityProduct, accounts[0]);
			ids = await marketplace.getProducts.call();
			assert(ids.length == 4, "Number of product ids should be 4");
			assert(ids[3] == product4Id, "Product Ids should match");

			await executeAndExpectThrow(async () => {await createProduct(zeroPriceProduct, accounts[0])});
			ids = await marketplace.getProducts.call();
			assert(ids.length == 4, "Number of product ids should be 4");
		})
	});

	describe("Test Update quantity Logic", () => {
		let productId;
		beforeEach(async () => {
			marketplace = await Marketplace.new(accounts[0]);
			productId = await createProduct(basicProduct, accounts[0]);
		})

		it("Update quantity with owner", async () => {
			let updateTx = await marketplace.update(productId, 10, {from: accounts[0]});
			let updateEvent = findEventAndGetArguments(updateTx, productUpdated);

			assert(updateEvent.itemId == productId, "Product Ids do not match, after update quantity");
			assert(updateEvent.oldQuantity == basicProduct.quantity, "Old quantities do not match");
			assert(updateEvent.newQuantity == 10, "Logged quantity in event do not match the requested quantity");

			let product = await marketplace.getProduct.call(productId);
			assert(product[2] == 10, "Product quantity do not match the requested one");
		})

		it("Update quantity to 0", async () => {
			await marketplace.update(productId, 0, {from: accounts[0]});
			let product = await marketplace.getProduct.call(productId);
			assert(product[2] == 0, "Product quantity do not match the requested one");
		})

		it("[Negative] update product quantity with non-owner", async () => {
			await executeAndExpectThrow(async () => {await marketplace.update(productId, 10, {from: accounts[1]})});
		})

		it("Change ownership and update quantity with new owner", async () => {
			let changeOwnershipTx = await marketplace.transferOwnership(accounts[1]);
			let newOwnerAddr = findEventAndGetArguments(changeOwnershipTx, ownershipTransferred).newOwner;
			assert(newOwnerAddr == accounts[1], "Owners do not match after transfer of ownership");

			await marketplace.update(productId, 999999, {from: accounts[1]});
			let product = await marketplace.getProduct.call(productId);
			assert(product[2] == 999999, "Product quantity do not match the requested one");
		})

		it("[Negative] change ownership, execute update quantity with old owner", async () => {
			let changeOwnershipTx = await marketplace.transferOwnership(accounts[1]);
			let newOwnerAddr = findEventAndGetArguments(changeOwnershipTx, ownershipTransferred).newOwner;
			assert(newOwnerAddr == accounts[1], "Owners do not match after transfer of ownership");

			await executeAndExpectThrow(async () => {await marketplace.update(productId, 20, {from: accounts[0]})});
		})
	});

	describe("Test Buy product Logic", () => {
		beforeEach(async () => {
			marketplace = await Marketplace.new(accounts[0]);
		})

		it("buy product", async () => {
			let productId = await createProduct(basicProduct, accounts[0]);
			let buyTx= await marketplace.buy(productId, 10, {value : basicProduct.price * 10});
			let purchaseEvent = findEventAndGetArguments(buyTx, productPurchased);

			assert(purchaseEvent.customerAdr == accounts[0], "Purchase address does not match with event argument");
			assert(purchaseEvent.itemId == productId, "Product ID does not match with event argument");
			assert(purchaseEvent.quantity == 10, "Quantity does not match with event argument");

			let product = await marketplace.getProduct.call(productId);
			assert(product[2] == 5, "Quantities do not match after buy");
		})

		it("[Negative] buy product with not enough value", async () => {
			let productId = await createProduct(basicProduct, accounts[0]);
			await executeAndExpectThrow(async () => {await marketplace.buy(productId, 10, {value : basicProduct.price * 5})});
		})

		it("[Negative] buy non-existing product", async () => {
			await executeAndExpectThrow(async () => {await marketplace.buy("0xnonexistingid", 10, {value : 100000})});
		})

		it("[Negative] buy product after quantity update", async () => {
			let zeroQuantityProductId = await createProduct(zeroQuantityProduct, accounts[0]);
			await executeAndExpectThrow(async () => {await marketplace.buy(zeroQuantityProductId, 10, {value : 100000})});

			await marketplace.update(zeroQuantityProductId, 1000, {from: accounts[0]});
			await marketplace.buy(zeroQuantityProductId, 100, {value : 1200*100});

			let product = await marketplace.getProduct.call(zeroQuantityProductId);
			assert(product[2] == 900, "quantity was not reduced after buying");
		})

		it("[Negative] buy product that does not have quantity", async () => {
			let zeroQuantityProductId = await createProduct(zeroQuantityProduct, accounts[0]);
			await executeAndExpectThrow(async () => {await marketplace.buy(zeroQuantityProductId, 10, {value: 100000})});
		})

		it("[Negative] buy product with zero quantity", async () => {
			let productId = await createProduct(basicProduct, accounts[0]);
			await executeAndExpectThrow(async () => {await marketplace.buy(productId, 0, {value: 100000})});
		})
	});

	describe("Test Calculate price Logic", () => {
		beforeEach(async () => {
			marketplace = await Marketplace.new(accounts[0]);
		})

		it("calculate prices of products", async () => {
			let productId = await createProduct(basicProduct, accounts[0]);
			let price = await marketplace.getPrice.call(productId, 150);
			assert(price == basicProduct.price * 150, "Calculated price was not correct");

			let zeroQuantityProductId = await createProduct(zeroQuantityProduct, accounts[0]);
			price = await marketplace.getPrice.call(zeroQuantityProductId, 1);
			assert(price == zeroQuantityProduct.price, "Calculated price was not correct");
		})
	});

	describe("Funding contract", () => {
		beforeEach(async () => {
			marketplace = await Marketplace.new(owner);
		})

		it("with owner", async () => {
			let tx = await marketplace.fund({from: owner, value : web3.toWei(1, "ether")});
			findEventAndGetArguments(tx, fundMarketplace);
			let balance = await marketplace.getBalance.call();
			assert(web3.toWei(1, "ether").toString() == balance.toString(), "Contract funding did not worked");
		})

		it("[Negative] with non-owner", async () => {
			await executeAndExpectThrow(async () => {await marketplace.fund({from: acc1, value : web3.toWei(1, "ether")})});
		})
	});

	describe ("Create Cooperative Buy", () => {
		let productId;

		beforeEach(async () => {
			marketplace = await Marketplace.new(owner);
			productId = await createProduct(basicProduct, accounts[0]);
		})

		it("[Negative] with many buyers", async () => {
			await executeAndExpectThrow(async () => {
				await createCoopBuy(productId, 5, [acc1, acc2, "0x1", "0x2", "0x3", "0x4"], acc1);
			});
		})

		it("[Negative] for non-existing product", async () => {
			await executeAndExpectThrow(async () => {
				await createCoopBuy("fakeID", 5, [acc1, acc2], acc1);
			});
		})

		it("[Negative] for a product with not enough quantity", async () => {
			await executeAndExpectThrow(async () => {
				await createCoopBuy(productId, 50, [acc1, acc2], acc1);
			});
		})

		it("valid cooperative purchase", async () => {
			let coopBuy = await createAndGetCoopBuy(productId, 1, [acc1, acc2], acc1);

			assert(coopBuy.productId == productId, "Product IDs do not match");
			assert(coopBuy.quantity.toString() == "1", "Quantities do not match");
			assert(coopBuy.numberOfParticipants.toString() == "2", "Number of participants do not match");
			assert(coopBuy.valueSent == 0, "Value sent is not 0 after coop-init");
			assert(!coopBuy.isFinished, "isFinished is true, should be false after init");
			assert(!coopBuy.hasFailed, "hasFailed is true, should be false after init");
		})

		it("check participants", async () => {
			let coopBuyId = await createCoopBuy(productId, 5, [acc2], acc1);
			let isParticipant = await marketplace.isParticipantOfCoopBuy.call(coopBuyId, {from: acc1});
			assert(isParticipant, "Sender is not participant");
			isParticipant =await marketplace.isParticipantOfCoopBuy.call(coopBuyId, {from: acc2});
			assert(isParticipant, "acc2 is not participant");

			isParticipant = await marketplace.isParticipantOfCoopBuy.call(coopBuyId, {from: accounts[5]});
			assert(!isParticipant, "Fake address is participant");
		})

		it("should buy normal product after coopBuy", async () => {
			let coopBuy = await createAndGetCoopBuy(productId, 1, [acc1, acc2], acc1);
			let buyTx = await marketplace.buy(productId, 10, {value : basicProduct.price * 10});
			findEventAndGetArguments(buyTx, productPurchased);
		})

		it("[Negative] should not buy normal product after big coopBuy", async () => {
			let coopBuy = await createAndGetCoopBuy(productId, 10, [acc1, acc2], acc1);
			await executeAndExpectThrow(async () => {await marketplace.buy(productId, 10, {value : basicProduct.price * 10})});
		})

		it("should buy normal product after big coopBuy fails", async () => {
			let coopBuy = await createAndGetCoopBuy(productId, 10, [acc1, acc2], acc1);
			await executeAndExpectThrow(async () => {await marketplace.buy(productId, 10, {value : basicProduct.price * 10})});

			await marketplace.markCoopBuyAsFailed(coopBuy.id, {from: owner});
			let buyTx = await marketplace.buy(productId, 10, {value : basicProduct.price * 10});
			findEventAndGetArguments(buyTx, productPurchased);
		})

	});

	describe("Mark Cooperative Buy as failed", () => {
		let coopBuy;
		let productId;

		beforeEach(async () => {
			marketplace = await Marketplace.new(owner);
			productId = await createProduct(basicProduct, accounts[0]);
			coopBuy = await createAndGetCoopBuy(productId, 10, [acc1, acc2], acc1);
		})

		it("with owner", async () => {
			let tx = await marketplace.markCoopBuyAsFailed(coopBuy.id, {from: owner});
			let args = findEventAndGetArguments(tx, coopBuyFailed);
			assert(args.coopBuyId == coopBuy.id, "Ids do not match after marking coopbuy as failed");
		})

		it("[Negative] with non-owner", async () => {
			await executeAndExpectThrow(async () => {await marketplace.markCoopBuyAsFailed(coopBuy.id, {from: acc1})});
		})
	});

	describe("Should remove product", () => {
		let productId;

		beforeEach(async () => {
			marketplace = await Marketplace.new(owner);
			productId = await createProduct(basicProduct, accounts[0]);
		})

		it("with owner", async () => {
			let tx = await marketplace.remove(productId, {from: owner});
			let args = findEventAndGetArguments(tx, productRemoval);
			assert(args.itemId == productId, "Product IDs do not match after removal");

			await executeAndExpectThrow(async () => {await marketplace.buy(productId, 10, {value : basicProduct.price * 10})});
		})

		it("[Negative] with non-owner", async () => {
			await executeAndExpectThrow(async () => {await marketplace.remove(productId, {from: acc1})});
			let buyTx = await marketplace.buy(productId, 10, {value : basicProduct.price * 10});
			findEventAndGetArguments(buyTx, productPurchased);
		})
	});

	describe("Refund", () => {
		let coopBuy;
		let productId;

		beforeEach(async () => {
			marketplace = await Marketplace.new(owner);
			productId = await createProduct(expensiveProduct, accounts[0]);
			coopBuy = await createAndGetCoopBuy(productId, 10, [acc1, acc2], acc1);
		})

		it("[Negative] participants cannot get refund if contract is not failed", async () => {
			await executeAndExpectThrow(async () => {await marketplace.refund(coopBuy.id, {from: acc1})});
		})
	});

	describe("Execute cooperative Buy", () => {
		let coopBuy;
		let productId;

		beforeEach(async () => {
			marketplace = await Marketplace.new(owner);
			productId = await createProduct(basicProduct, accounts[0]);
			coopBuy = await createAndGetCoopBuy(productId, 10, [acc1, acc2], acc1);
		})

		//TODO

	});

})
