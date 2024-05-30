export const idlFactory = ({ IDL }) => {
  const HttpResponse = IDL.Rec();
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const Token = IDL.Record({
    'key' : IDL.Text,
    'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'index' : IDL.Nat,
    'content_encoding' : IDL.Text,
  });
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : Token,
      'callback' : IDL.Func([Token], [HttpResponse], ['query']),
    }),
  });
  HttpResponse.fill(
    IDL.Record({
      'body' : IDL.Vec(IDL.Nat8),
      'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
      'streaming_strategy' : IDL.Opt(StreamingStrategy),
      'status_code' : IDL.Nat16,
    })
  );
  const CanisterStatusType = IDL.Variant({
    'stopped' : IDL.Null,
    'stopping' : IDL.Null,
    'running' : IDL.Null,
  });
  const DefiniteCanisterSettings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'reserved_cycles_limit' : IDL.Nat,
    'wasm_memory_limit' : IDL.Nat,
    'memory_allocation' : IDL.Nat,
    'compute_allocation' : IDL.Nat,
  });
  const QueryStats = IDL.Record({
    'response_payload_bytes_total' : IDL.Nat,
    'num_instructions_total' : IDL.Nat,
    'num_calls_total' : IDL.Nat,
    'request_payload_bytes_total' : IDL.Nat,
  });
  const CanisterStatusResponse = IDL.Record({
    'status' : CanisterStatusType,
    'memory_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'settings' : DefiniteCanisterSettings,
    'query_stats' : QueryStats,
    'idle_cycles_burned_per_day' : IDL.Nat,
    'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'reserved_cycles' : IDL.Nat,
  });
  return IDL.Service({
    'get_photo' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'get_photo_number' : IDL.Func([], [IDL.Nat64], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'status' : IDL.Func([], [CanisterStatusResponse], []),
    'upload_photo' : IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Nat64], []),
  });
};
export const init = ({ IDL }) => { return []; };
