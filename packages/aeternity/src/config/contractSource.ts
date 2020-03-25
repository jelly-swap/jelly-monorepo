export default `@compiler >= 4

include "List.aes"

contract HashTimeLock = 
  datatype status = INVALID | ACTIVE | REFUNDED | WITHDRAWN | EXPIRED 

  datatype event =
    Withdraw(indexed hash, indexed address, indexed address, string)
    | Refund(indexed hash, indexed address, indexed address, string)
    | New_contract(indexed hash, indexed address, indexed address, string)

  stateful payable entrypoint new_contract  : (int, int, hash, address, string, string) => unit
  stateful entrypoint withdraw              : (hash, hash) => unit
  stateful entrypoint refund                : (hash) => unit
  entrypoint get_one_status                 : (hash) => status
  entrypoint get_many_status                : (list(hash)) => list(status)
  entrypoint generate_id                    : (address, address, int, hash, int) => hash
`;
