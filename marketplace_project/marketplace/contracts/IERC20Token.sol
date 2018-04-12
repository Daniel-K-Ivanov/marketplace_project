pragma solidity 0.4.19;

contract IERC20Token {

    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transferFrom(address from, address to, uint value) public returns (bool success);

}
