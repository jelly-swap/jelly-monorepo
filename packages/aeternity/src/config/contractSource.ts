export default `@compiler >= 4
include "List.aes"

contract JellyHTLC =

  record state = { swaps : map(hash, swap) }

  datatype status = INVALID | ACTIVE | REFUNDED | WITHDRAWN | EXPIRED

  record swap = {
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
    Withdraw(hash, address, address, string)
    | Refund(hash, address, address, string)
    | NewSwap(hash, address, address, string)

  stateful payable entrypoint new_swap : (int, int, hash, address, string, string) => unit
  stateful entrypoint withdraw         : (hash, hash)                              => unit
  stateful entrypoint refund           : (hash)                                    => unit

  entrypoint get_one_status            : (hash)                                    => status
  entrypoint get_many_status           : (list(hash))                              => list(status)
  entrypoint generate_id               : (address, address, int, hash, int)        => hash
  entrypoint get_swap                  : (hash)                                    => swap
`;
