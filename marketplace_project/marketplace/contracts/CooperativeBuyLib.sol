pragma solidity 0.4.19;

import "./SafeMath.sol";


/**
* @title CooperativeBuyLib
* @dev Library providing basic functions for creating and updating a cooperative buy.
*/
library CooperativeBuyLib {

    using SafeMath for uint;

    struct CooperativeBuy {
        bytes32 id;
        bytes32 productId;
        uint quantity;
        mapping(address => bool) isParticipant;
        mapping(address => bool) hasParticipated;
        uint numberOfParticipants;
        uint valueSent;
        uint timestamp;
        bool isFinished;
        bool hasFailed;
        mapping(address => bool) hasRefunded;
    }

    /**
    * @dev initializes and returns cooperative buy. Checks the values
    */
    function init(bytes32 _id, bytes32 _productId, uint _quantity, uint _now)
        internal pure returns (CooperativeBuy) {

        assert(_id != bytes32(0));
        assert(_id != bytes32(0));
        assert(_quantity != 0);

        return CooperativeBuy({
            id: _id,
            productId : _productId,
            quantity : _quantity,
            valueSent : 0,
            numberOfParticipants : 0,
            timestamp : _now,
            isFinished : false,
            hasFailed : false
        });
    }

    /**
    * @dev Populates the participants in the CooperativeBuy and their number
    */
    function populateParticipants(CooperativeBuy storage self, address[] _participants) internal {
		assert(_participants.length >= 2 && _participants.length <= 5);
        for(uint i = 0; i < _participants.length; i++) {
            self.isParticipant[_participants[i]] = true;
        }
        self.numberOfParticipants = _participants.length;
    }

    /**
    * @dev Updates the value sent and marks the buyer as 'participated'
    */
    function buy(CooperativeBuy storage self, uint _eachBuyerPrice) internal {
        self.valueSent = self.valueSent.add(_eachBuyerPrice);
        self.hasParticipated[msg.sender] = true;
    }

    /**
    * @dev Marks the CooperativeBuy as finished
    */
    function markFinished(CooperativeBuy storage self) internal {
        self.isFinished = true;
    }

    /**
    * @dev Marks the CooperativeBuy as timedout
    */
    function markFailed(CooperativeBuy storage self) internal {
        self.hasFailed = true;
    }

    function markRefund(CooperativeBuy storage self) internal {
        self.hasRefunded[msg.sender] = true;
    }

}
