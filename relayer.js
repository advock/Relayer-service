const EthSigUtil = require('eth-sig-util');
const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const { ethers } = require('@metamask/providers');

const contractAbi = require('./contractABI');
const { soliditySha3 } = require('web3-utils');

const contract_address = "ox...";




//connect to metamask
const providerURl = 'https://mainnet.infura.io/v3/225b603049bc41ca9de47495a0b2828a';
const web3 = new Web3(providerURl);

async function connectwallet() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts');
}

// enable metamask provider
// if (window.ethereum) {
//     window.ethereum.enable();
// }



// Define the EIP-712 typed data for the transaction
const typedData = [
    {
        type: 'address',
        name: 'from',
    },
    {
        type: 'address',
        name: 'to',
    },
    {
        type: 'uint256',
        name: 'value',
    },

    {
        type: 'uint256',
        name: 'nonce',
    },
];


const domainSeparator = {
    name: 'AutoMata Project',
    version: '1.0.0',
    chainId: 1, // Chain ID for Ethereum mainnet
    verifyingContract: null, // Replace with the contract address or null if not applicable
};

async function getConnectedUserAddress() {
    try {
        // Request the user's Ethereum address from MetaMask
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            const address = accounts[0];
            return address;
        } else {
            throw new Error('No accounts found');
        }
    } catch (error) {
        console.error('Failed to get user address:', error);
        throw error;
    }
};

const userAddress = getConnectedUserAddress();
const nonce = web3.eth.getTransactionCount(userAddress);


async function createTx(ToAdrrs, amount) {
    const to = ToAdrrs;
    const value = amount;

    const tx = {
        from: userAddress,
        to: ToAdrrs,
        value: amount,
        nounce: nonce,
    };


    // Create the EIP-712 typed data
    const eip712Data = {
        types: {
            EIP712Domain: domainSeparator,
            Transaction: typedData,
        },
        primaryType: 'ERC20 transfer',
        domain: domainSeparator,
        message: {
            from: userAddress,
            to: to,
            value: value,
            nonce: nonce,
        },
    };


    // sign the tx
    const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [from, eip712Data],
    });

    const messageHash = soliditySha3(
        { t: 'address', v: from }, // Nonce
        { t: 'address', v: to }, // Target address
        { t: 'uint256', v: value },
        { t: 'uiint256', v: nonce }
    )

}



function callMetx() {
    const contractInstance = new web3.eth.Contract(contractAbi, contract_address);

    const metaTransaction = {
        signer: userAddress,
        nonce: nonce,
        amount: value,
        to: to,
        messageHash: messageHash,

    }

    const structType = "MetaTransaction";
    const structObject = web3.utils.toSolidityType(structType, metaTransaction);

    contractInstance.methods.processMetaTransacation(structObject, signature);


}