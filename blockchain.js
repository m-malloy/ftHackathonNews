
      // PLEASE NOTE that the minimum Chrome version to run this code is 55 (async/await)

      // Token contract code used for this example: https://gist.github.com/makevoid/ec7f9d94fdeb78d06cea48a17a117213

      // Any ERC20 Ethereum Standard Token will be compatible with this script.

      var d = document
      var c = console
      var g = window // global scope shortcut
      g.bytecode = null
      g.abi = null
      g.news_bytecode = null
      g.news_abi = null
      g.contractAddress = null
      g.tokenContract = null
      g.newsContract = null

      var main = async function() {
        // setup web3
        if (typeof web3 !== 'undefined') {
          // connect to metamask (preferred)
          g.web3 = new Web3(web3.currentProvider)
        } else {
          // connect to your local geth or parity node instead
          g.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
        }
        g.eth = g.web3.eth

        // setup functions to be called via await (simpler than using callbacks)
        var getCoinbase = Promise.promisify(g.eth.getCoinbase)
        g.getBalance    = Promise.promisify(g.eth.getBalance)

        // get your first ethereum address (coinbase address)
        g.coinbase = await getCoinbase()

        // token contract class
        var TokenContract = g.eth.contract(g.abi)
        g.TokenContract   = TokenContract

        // token contract instance
        if (localStorage.ftw_token_address) {
          g.tokenContract = TokenContract.at(localStorage.ftw_token_address)
        }


        // news contract class
        var NewsContract = g.eth.contract(g.news_abi)
        g.NewsContract   = NewsContract

        // news contract instance
        if (localStorage.ftw_token_address) {
          g.newsContract = NewsContract.at(localStorage.ftw_news_address)
        }

        // all actions
        bindAddContent()
        loadAddress()
        updateBalance()
        updateTokenBalance()
        bindCheckPrice()
      }

      // calls eth.getBalance (gets balance in weis - "micro" ethers)
      var updateBalance = async function() {
        var balance = await g.getBalance(g.coinbase)
        if(d.querySelector(".balance")){
          d.querySelector(".balance").innerHTML = balance
        }
      }

      // calls token.balanceOf (token balance of a specific address)
      var updateTokenBalance = async function() {
        var balanceOf = Promise.promisify(g.tokenContract.balanceOf)
        var symbol    = Promise.promisify(g.tokenContract.symbol)

        var balance = await balanceOf(g.coinbase) // in this case the address is your current metamask address (coinbase)
        var sym     = await symbol()

        var tokenBalance = d.querySelector(".token_balance")
        var tokenSymbol  = d.querySelector(".token_symbol")
        if(tokenBalance && tokenSymbol){
          tokenBalance.innerHTML = balance
          tokenSymbol.innerHTML  = sym
        }
      }

      var loadAddress = function () {
        // loads address from local storage if you have already deployed a token contract address with this browser "user/account"
        var address = localStorage.ftw_token_address
        if (address) {
          g.contractAddress = address
          var addressElem = d.querySelector(".contract_address")
          if(addressElem){
            addressElem.innerHTML = address
          }
          g.tokenContract = g.TokenContract.at(localStorage.ftw_token_address)
        }
      }

      // this function will be called twice so it wasn't possible to promisify-it
      // the second time you get this callback your token contract will be likely to be deployed already and you will get the address of it
      var contractDeploymentCallback = function(err, resp) {
        if (err) c.error(err)
        var address = resp.address
        var addressElem = d.querySelector(".contract_address")
        addressElem.innerHTML = "Waiting for the transaction to be confirmed.... (can take up to a minute)"

        if (address) {
          addressElem.innerHTML = address
          // we save the address in the local storage so we can point to the same contract after a browser refresh
          localStorage.ftw_token_address = address
          g.contractAddress = address
        }
      }

      // this is the first time we actually do a sendTransaction call (a standard ethereum transaction)
      // here we call the token contract method `transfer`
      var addContent = async function() {
        var recipientElem = d.querySelector(".recipient_address")
        var recipient = recipientElem.value

        var contentPriceElem = d.querySelector(".content_price")
        var contentPrice = contentPriceElem.value;

        var contentHashElem = d.querySelector(".content_hash")
        var contentHash = contentHashElem.value;

        var add = Promise.promisify(g.newsContract.add);
        var result = await add(g.web3.toHex(contentHash), contentPrice);

        // var transfer = Promise.promisify(g.tokenContract.transfer)
        //var tokenTransferAmount = 100 // FIXME" hardcoded amount, in a real app you probably want to specify the amount transfered
        //var result = await transfer(recipient, tokenTransferAmount)
        c.log(result)
      }

      var checkPrice = async function(){
        var contentHashElem = d.querySelector(".check_price_hash")
        var contentHash = contentHashElem.value;
        var getPrice = Promise.promisify(g.newsContract.getPrice);
        g.newsContract.getPrice(g.web3.toHex(contentHash), function(_, value){ 
            console.log(Number(value)) 
            document.getElementById("price_of_hash").innerHTML = "Price of your content is: " + Number(value);
        })
      }

      var bindAddContent = function() {
        var sendTokensBtn = d.querySelector(".drag_and_drop")
        sendTokensBtn.addEventListener("click", addContent)
      }

      var bindCheckPrice = function() {
          var checkPriceBtn = d.querySelector(".check_price_btn")
          checkPriceBtn.addEventListener("click", checkPrice)
      }

      window.addEventListener('load', main)

      // long (but important) variables are defined here (contract bytecode and contract ABI):

      // bytecode is the contrect compiled in binary format, needed to "deploy" (publish) the contract to the ethereum network
      // abi is the application binary interface, it tells your web3.js library which are the function names and its arguments to be able to call them.

      // contract bytecode
      g.bytecode = "6060604052620f4240600055341561001657600080fd5b5b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060005460026000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b5b610bf5806100d16000396000f300606060405236156100a2576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100a7578063095ea7b31461013657806318160ddd1461019057806323b872dd146101b9578063313ce5671461023257806370a08231146102615780638da5cb5b146102ae57806395d89b4114610303578063a9059cbb14610392578063dd62ed3e146103ec575b600080fd5b34156100b257600080fd5b6100ba610458565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100fb5780820151818401525b6020810190506100df565b50505050905090810190601f1680156101285780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561014157600080fd5b610176600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610491565b604051808215151515815260200191505060405180910390f35b341561019b57600080fd5b6101a3610584565b6040518082815260200191505060405180910390f35b34156101c457600080fd5b610218600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001909190505061058e565b604051808215151515815260200191505060405180910390f35b341561023d57600080fd5b61024561089a565b604051808260ff1660ff16815260200191505060405180910390f35b341561026c57600080fd5b610298600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190505061089f565b6040518082815260200191505060405180910390f35b34156102b957600080fd5b6102c16108e9565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b341561030e57600080fd5b61031661090f565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103575780820151818401525b60208101905061033b565b50505050905090810190601f1680156103845780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561039d57600080fd5b6103d2600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610948565b604051808215151515815260200191505060405180910390f35b34156103f757600080fd5b610442600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610b41565b6040518082815260200191505060405180910390f35b6040805190810160405280601081526020017f46696e746563685765656b546f6b656e0000000000000000000000000000000081525081565b600081600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a3600190505b92915050565b6000805490505b90565b600081600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015801561065b575081600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410155b80156106675750600082115b80156106f25750600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205401115b156108895781600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a360019050610893565b60009050610893565b5b9392505050565b601281565b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490505b919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6040805190810160405280600381526020017f465754000000000000000000000000000000000000000000000000000000000081525081565b600081600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101580156109995750600082115b8015610a245750600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205401115b15610b315781600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a360019050610b3b565b60009050610b3b565b5b92915050565b6000600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490505b929150505600a165627a7a72305820eed3d631954f23f20e2916786b19e4fb964dae7d61131312d6cc8f52faa6592d0029"
      // contract abi
      g.abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"totalSupply","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]

      // news contract bytecode, abi
      g.news_bytecode = "6060604052341561000f57600080fd5b5b33600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b610847806100626000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680634559b8921461006a5780634b2116be146101365780636b4dd158146101ab578063881c75de1461021c578063a46dd54e146102fc575b600080fd5b6100ba600480803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610371565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100fb5780820151818401525b6020810190506100df565b50505050905090810190601f1680156101285780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561014157600080fd5b610191600480803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610520565b604051808215151515815260200191505060405180910390f35b34156101b657600080fd5b610206600480803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506105ed565b6040518082815260200191505060405180910390f35b341561022757600080fd5b610280600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001909190505061066c565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102c15780820151818401525b6020810190506102a5565b50505050905090810190601f1680156102ee5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561030757600080fd5b610357600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061073a565b604051808215151515815260200191505060405180910390f35b610379610807565b6000806000846040518082805190602001908083835b6020831015156103b557805182525b60208201915060208101905060208303925061038f565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051809103902091506001846040518082805190602001908083835b60208310151561042357805182525b6020820191506020810190506020830392506103fd565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390209050816001015434101561046957600080fd5b338160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc349081150290604051600060405180830381858888f19350505050151561051057600080fd5b839250610519565b5b5050919050565b6000806000836040518082805190602001908083835b60208310151561055c57805182525b602082019150602081019050602083039250610536565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051809103902090503373ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161491505b50919050565b6000806000836040518082805190602001908083835b60208310151561062957805182525b602082019150602081019050602083039250610603565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390209050806001015491505b50919050565b610674610807565b600080846040518082805190602001908083835b6020831015156106ae57805182525b602082019150602081019050602083039250610688565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390209050338160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508281600101819055508391505b5092915050565b6000806001836040518082805190602001908083835b60208310151561077657805182525b602082019150602081019050602083039250610750565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051809103902090503373ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161491505b50919050565b6020604051908101604052806000815250905600a165627a7a72305820d5505e054fe447c441ce79efc24317eef218a2753fa40870349e1279db72315a0029"
      g.news_abi = [{"constant":false,"inputs":[{"name":"fingerprint","type":"bytes"}],"name":"buy","outputs":[{"name":"_fingerprint","type":"bytes"}],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"fingerprint","type":"bytes"}],"name":"proveOwnership","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"fingerprint","type":"bytes"}],"name":"getPrice","outputs":[{"name":"_price","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"fingerprint","type":"bytes"},{"name":"price","type":"uint256"}],"name":"add","outputs":[{"name":"_fingerprint","type":"bytes"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"fingerprint","type":"bytes"}],"name":"proveBuy","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}]