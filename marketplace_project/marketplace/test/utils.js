module.exports = {
	assertProductsEqual : (p1, aP2) => {
		assert(p1.name == aP2[0], "names should be equal");
		assert(p1.price == aP2[1], "prices should be equal");
		assert(p1.quantity == aP2[2], "quantities should be equal");
	},

	findEventAndGetArguments : (tx, eventToSearchFor) => {
		let events = tx.logs.filter(e => {
			return e.event = eventToSearchFor;
		});
		assert(events.length > 0, "No events with name " + eventToSearchFor + " were found!");
		return events[0].args;
	},

	executeAndExpectThrow : async (fn) => {
		let hasFailed = false;
		await fn().catch(err => {
			const invalidOpcode = err.message.search('invalid opcode') >= 0;
			const outOfGas = err.message.search('out of gas') >= 0;
			const revert = err.message.search('revert') >= 0;
			assert(invalidOpcode || outOfGas || revert, 'Expected throw, got \'' + err + '\' instead');
			hasFailed = true;
		});
		assert(hasFailed, "An error was expected, but there was not");
	},

	Events : {
		productCreated : {
			name : "ProductCreated",
			args : ["itemId"]
		},
		productPurchased : {
			name : "ProductPurchased",
			args : ["customerAdr", "itemId", "quantity"]
		},
		productUpdated : {
			name : "ProductQuantityUpdated",
			args : ["itemId", "oldQuantity", "newQuantity"]
		},
		ownershipTransferred : {
			name : "OwnershipTransferred",
			args : ["previousOwner", "newOwner"]
		},
		fundsWithdrawal : {
			name : "FundsWithdrawal",
			args : ["adr", "amonut"]
		}
	}
}
