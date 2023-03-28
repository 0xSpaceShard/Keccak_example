import { expect } from "chai";
import { starknet, ethers } from "hardhat";
import {
    StarknetContract,
    Account,
} from "hardhat/types/runtime";
import { uint256 } from "starknet";
import axios from "axios";

async function mint(address: string, amount: number, lite = true) {
    await axios.post(`${starknet.networkConfig.url}/mint`, {
        amount,
        address,
        lite,
    });
}

describe("Exercise 2", function () {
    this.timeout(900_000);

    let owner: Account;
    let exerciseContract: StarknetContract;

    before(async function () {
        owner = await starknet.OpenZeppelinAccount.createAccount();

        await mint(owner.address, 1e18);
        await owner.deployAccount({ maxFee: 1e18 });

        const exerciseFactory = await starknet.getContractFactory("exercises");
        await owner.declare(exerciseFactory, { maxFee: 1e18 });

        exerciseContract = await owner.deploy(exerciseFactory, {}, { maxFee: 1e18 });
    });

    describe("Test exercise 2", function () {
        it("Should have the same hash as solidity keccak256(abi.encodePacked(uint256,bytes32, address))", async function () {
            const { hash: hash } = await exerciseContract.call("exercise2", {
                a_uint256: uint256.bnToUint256(230), b_uint256: uint256.bnToUint256("0x8ee3dbcdef0876763610fbdbed3ff2f4c14425bc81d10df7378e47a83e42b253"), address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            });
            const solidityHash = ethers.utils.solidityKeccak256(
                ["uint256", "bytes32", "address"],
                [230, "0x8ee3dbcdef0876763610fbdbed3ff2f4c14425bc81d10df7378e47a83e42b253", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"]
            );
            const starknetHash = "0x" + uint256.uint256ToBN(hash).toString(16);
            console.log("Solidity hash: ", solidityHash);
            console.log("Starknet hash: ", starknetHash);
            expect(solidityHash).to.deep.equal(starknetHash);
        });
    });
});