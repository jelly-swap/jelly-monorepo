export default `include "List.aes"

contract HashTimeLock = 

  record state = { contracts : map(hash, lock_contract) }

  datatype status = INVALID | ACTIVE | REFUNDED | WITHDRAWN | EXPIRED 

  record lock_contract = {
    input_amount : int,
    output_amount : int,
    expiration : int,
    hash_lock : hash,
    status: status,
    sender : address,
    receiver : address,
    output_network : string,
    output_address : string}

  datatype event =
    Withdraw(indexed hash, indexed address, indexed address, string)
    | Refund(indexed hash, indexed address, indexed address, string)
    | New_contract(indexed hash, indexed address, indexed address, string)

  function withdrawable(_contract : lock_contract, secret : hash) =
    require(is_active(_contract.status), "SWAP_NOT_ACTIVE")
    require(_contract.expiration > Chain.timestamp, "INVALID_TIME")
    require(_contract.hash_lock == Crypto.sha256(secret), "INVALID_SECRET")

  function refundable(_contract: lock_contract) =
    require(is_active(_contract.status), "SWAP_NOT_ACTIVE")
    require(Chain.timestamp >= _contract.expiration, "INVALID_TIME")
    require(_contract.sender == Call.caller, "INVALID_SENDER")

  payable stateful entrypoint new_contract(
      output_amount : int,
      expiration : int, 
      hash_lock : hash, 
      receiver : address, 
      output_network : string, 
      output_address : string) : lock_contract =
    
    let sender : address = Call.caller
    
    let input_amount : int = Call.value
    
    let id : hash = generate_id(sender, receiver, input_amount, hash_lock, expiration)
    
    let new_contract : lock_contract = { 
      input_amount = input_amount,
      output_amount = output_amount,
      expiration = expiration,
      hash_lock = hash_lock,
      status = ACTIVE,
      sender = sender,
      receiver = receiver,
      output_network = output_network,
      output_address = output_address }

    require(expiration > Chain.timestamp, "INVALID_TIME")
    require(input_amount > 0, "INVALID_AMOUNT")

    put(state{ contracts[id] = new_contract })

    let swap_message : string = generate_swap_message(new_contract)
    
    Chain.event(New_contract(id, sender, receiver, swap_message))
    
    state.contracts[id]

  stateful entrypoint withdraw(id : hash, secret : hash) =
    let _contract: lock_contract = state.contracts[id]
    withdrawable(_contract, secret)

    Chain.spend(_contract.receiver, _contract.input_amount)

    put(state{contracts[id].status = WITHDRAWN})

    Chain.event(Withdraw(id, _contract.sender, _contract.receiver, generate_withdraw_message(secret, _contract.hash_lock) ))

  stateful entrypoint refund(id : hash) =
    let _contract : lock_contract = state.contracts[id]
    refundable(_contract)
    
    Chain.spend(_contract.sender, _contract.input_amount)

    put(state{ contracts[id].status = REFUNDED })

    Chain.event(Refund(id, _contract.sender, _contract.receiver, Bytes.to_str(_contract.hash_lock)))

  entrypoint get_one_status(id : hash) : status =
    let _contract : lock_contract = state.contracts[id]

    if(_contract.status == ACTIVE &&
        _contract.expiration < Chain.timestamp)
      EXPIRED
    else
      _contract.status

  entrypoint get_many_status(ids : list(hash)) : list(status) =
    List.map((id) => get_one_status(id), ids)

  function generate_id(sender : address, receiver : address,
   input_amount : int, hash_lock : hash, expiration : int) : hash =
    let packed_string : string = String.concat(String.concat(String.concat(Address.to_str(sender), 
      Address.to_str(receiver)), String.concat(Int.to_str(input_amount),
       Bytes.to_str(hash_lock))), Int.to_str(expiration))
    Crypto.sha256(packed_string)
    
  function generate_withdraw_message(secret : hash, hash_lock : hash) : string =
    concat(Bytes.to_str(secret), Bytes.to_str(hash_lock))

  function generate_swap_message(new_contract : lock_contract) : string =
    concat(concat(new_contract.output_network, new_contract.output_address),
     concat(concat(Int.to_str(new_contract.input_amount), Int.to_str(new_contract.output_amount)),
     concat(Int.to_str(new_contract.expiration), Bytes.to_str(new_contract.hash_lock))))
  
  function is_active(x : status) : bool =
    x == ACTIVE

  function concat(a : string, b : string) =
    String.concat(String.concat(a, ","),b)

  entrypoint  init() = { contracts = {} }
`;
