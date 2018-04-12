pragma solidity 0.4.19;

import "./SafeMath.sol";


/**
* @title TokenTransactionsLib
* @dev Library providing basic functions for creating and updating a token transaction.
*/
library TokenTransactionsLib {

    struct TokenTransaction {
        bytes32 id;
        address buyer;
        bytes32 productId;
        uint quantity;
        string tokenSymbol;
        bool isPending;
    }

    function initTransaction(bytes32 _id, address _buyer, bytes32 _productId, uint _quantity, string _tokenSymbol) internal pure returns (TokenTransaction) {
        return TokenTransaction({
            id: _id,
            buyer : _buyer,
            productId : _productId,
            quantity : _quantity,
            isPending : true,
            tokenSymbol : _tokenSymbol
        });
    }

    function markFinished(TokenTransaction storage self) public {
        self.isPending = false;
    }
}
