export default `
include "List.aes"
@compiler >= 4

contract AEX9Token =
  record meta_info =
    { name : string
    , symbol : string
    , decimals : int }

  record allowance_accounts = { from_account : address, for_account : address }
  type allowances = map(allowance_accounts, int)

  datatype event =
    Transfer(address, address, int)
    | Allowance(address, address, int)
    | Burn(address, int)
    | Mint(address, int)
    | Swap(address, int)

  entrypoint aex9_extensions      : ()                      => list(string)
  entrypoint meta_info            : ()                      => meta_info
  entrypoint total_supply         : ()                      => int
  entrypoint owner                : ()                      => address
  entrypoint balances             : ()                      => map(address, int)
  entrypoint balance              : (address)               => option(int)
  entrypoint transfer             : (address, int)          => unit
  entrypoint allowances           : ()                      => allowances
  entrypoint allowance            : (allowance_accounts)    => option(int)
  entrypoint allowance_for_caller : (address)               => option(int)
  entrypoint transfer_allowance   : (address, address, int) => unit
  entrypoint create_allowance     : (address, int)          => unit
  entrypoint change_allowance     : (address, int)          => unit
  entrypoint reset_allowance      : (address)               => unit
  entrypoint burn                 : (int)                   => unit
  entrypoint mint                 : (address, int)          => unit
  entrypoint swap                 : ()                      => unit
  entrypoint check_swap           : (address)               => int
  entrypoint swapped              : ()                      => map(address, int)

contract HashTimeLock = 

  record state = { contracts : map(hash, lock_contract) }

  datatype status = INVALID | ACTIVE | REFUNDED | WITHDRAWN | EXPIRED 

  record lock_contract = {
    input_amount : int,
    output_amount : int,
    expiration : int,
    hash_lock : hash,
    status: status,
    token: AEX9Token,
    sender : address,
    receiver : address,
    output_network : string,
    output_address : string}

  datatype event =
    Withdraw(indexed hash, indexed address, indexed address, string)
    | Refund(indexed hash, indexed address, indexed address, string)
    | New_contract(indexed hash, indexed address, indexed address, string)

  entrypoint  init() = { contracts = {} }

  stateful entrypoint new_contract(
      input_amount : int,
      output_amount : int,
      expiration : int, 
      hash_lock : hash, 
      receiver : address, 
      token: AEX9Token,
      output_network : string, 
      output_address : string) : lock_contract =
    
    let sender : address = Call.caller
        
    let id : hash = generate_id(sender, receiver, input_amount, hash_lock, expiration)
    
    let new_contract : lock_contract = { 
      input_amount = input_amount,
      output_amount = output_amount,
      expiration = expiration,
      hash_lock = hash_lock,
      status = ACTIVE,
      token = token,
      sender = sender,
      receiver = receiver,
      output_network = output_network,
      output_address = output_address }

    require(expiration > Chain.timestamp, "INVALID_TIME")
    require(input_amount > 0, "INVALID_AMOUNT")

    token.transfer_allowance(sender, Contract.address, input_amount)

    put(state{ contracts[id] = new_contract })

    let swap_message : string = generate_swap_message(new_contract)
    
    Chain.event(New_contract(id, sender, receiver, swap_message))
    
    state.contracts[id]

  stateful entrypoint withdraw(id : hash, secret : hash, token: AEX9Token) =
    let _contract: lock_contract = state.contracts[id]
    
    withdrawable(_contract, secret, token)

    token.transfer(_contract.receiver, _contract.input_amount)

    put(state{contracts[id].status = WITHDRAWN})

    let withdraw_message : string = generate_withdraw_message(secret, _contract.hash_lock, token)

    Chain.event(Withdraw(id, _contract.sender, _contract.receiver, withdraw_message))

  stateful entrypoint refund(id : hash, token: AEX9Token) =
    let _contract : lock_contract = state.contracts[id]
    
    refundable(_contract, token)
    
    token.transfer(_contract.sender, _contract.input_amount)

    put(state{ contracts[id].status = REFUNDED })

    let refund_message : string = generate_refund_message(_contract.hash_lock, token)

    Chain.event(Refund(id, _contract.sender, _contract.receiver, refund_message))

  entrypoint get_one_status(id : hash) : status =
    let _contract : lock_contract = state.contracts[id]

    if(_contract.status == ACTIVE &&
        _contract.expiration < Chain.timestamp)
      EXPIRED
    else
      _contract.status

  entrypoint get_many_status(ids : list(hash)) : list(status) =
    List.map((id) => get_one_status(id), ids)

  entrypoint generate_id(sender : address, receiver : address,
   input_amount : int, hash_lock : hash, expiration : int) : hash =
    let packed_string : string = String.concat(String.concat(String.concat(Address.to_str(sender), 
      Address.to_str(receiver)), String.concat(Int.to_str(input_amount),
       Bytes.to_str(hash_lock))), Int.to_str(expiration))
    Crypto.sha256(packed_string)
    
  function withdrawable(_contract : lock_contract, secret : hash, token: AEX9Token) =
    require(is_active(_contract.status), "SWAP_NOT_ACTIVE")
    require(_contract.token == token, "INVALID_TOKEN")
    require(_contract.expiration > Chain.timestamp, "INVALID_TIME")
    require(_contract.hash_lock == Crypto.sha256(secret), "INVALID_SECRET")

  function refundable(_contract: lock_contract, token: AEX9Token) =
    require(is_active(_contract.status), "SWAP_NOT_ACTIVE")
    require(_contract.token == token, "INVALID_TOKEN")
    require(Chain.timestamp >= _contract.expiration, "INVALID_TIME")
    require(_contract.sender == Call.caller, "INVALID_SENDER")

  function generate_withdraw_message(secret : hash, hash_lock : hash, token: AEX9Token) : string =
    concat(concat(Bytes.to_str(secret), Bytes.to_str(hash_lock)), Address.to_str(token.address))

  function generate_refund_message(hash_lock : hash, token: AEX9Token) : string =
    concat(Bytes.to_str(hash_lock), Address.to_str(token_address(token)))
    
  function generate_swap_message(new_contract : lock_contract) : string =
    concat(concat(new_contract.output_network, new_contract.output_address),
     concat(concat(Int.to_str(new_contract.input_amount), Int.to_str(new_contract.output_amount)),
      concat(concat(Int.to_str(new_contract.expiration), Bytes.to_str(new_contract.hash_lock)), Address.to_str(token_address(new_contract.token)))))
  
  function is_active(x : status) : bool =
    switch(x)
      ACTIVE => true
      _ => false

  function concat(a : string, b : string) = String.concat(String.concat(a, ","), b)
  
  function token_address(token : AEX9Token) : address = token.address
`;
