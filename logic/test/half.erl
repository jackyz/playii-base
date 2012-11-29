-module(half).

-export([init/1, exec/3]).

-record(data, {
	  parent,              %% 父场景   "god"
	  self,                %% 自身标识 "/test/half"
	  ul,                  %% 用户列表 dict
	  wl                   %% 场景列表 dict
	 }).

-define(cmds, cmds).           %% cmds 暂存在 process dictionary
-define(logs, logs).           %% logs 暂存在 process dictionary

-include_lib("eunit/include/eunit.hrl").

%%====================================================================
%% API
%%====================================================================

init([Parent, Self]) ->
    Log = debug("init(~p, ~p)", [Parent, Self]),
    Data = #data{parent=Parent, self=Self, ul=dict:new(), wl=dict:new()},
    {Data, [], [Log]};

%% @spec init(Args) -> {Data, Cmds, Logs} | {error, E}
init(Args) ->
    ?debugFmt("init(~p) not_implement", [Args]),
    {error, not_implement}.

exec(Data, Func, Args) ->
    try
	case func(Data, Func, Args) of
	    undefined -> {error, undefined};
	    Data2 -> {Data2, flush(?cmds), flush(?logs)}
	end
    catch
	_:E ->
	    {error, E}
    end.

func(#data{wl=Wl}=Data, "idle", []) ->
    debug("idle()", []),
    Now = now(),
    F = fun
	    (Where, Users) ->
		[{Who, Time} || {Who, Time} <- Users,
				timer:now_diff(Now, Time) < 45000000]
	end,
    Wl2 = dict:map(F, Wl),
    Data#data{wl=Wl2};

%% exec(#data{ul=Ul}=Data, "enter", Args) ->
%%     Who = arg(1, Args),
%%     Param = arg(2, Args),
%%     Store = arg(3, Args),
func(#data{ul=Ul}=Data, "enter", [Who, Param, Store]) ->
    debug("enter(~p, ~p, ~p)", [Who, Param, Store]),
    Ul2 = dict:store(Who, {Who, Param, Store}, Ul),
    Data#data{ul=Ul2};

%% exec(#data{wl=Wl}=Data, "poll", Args) ->
%%     Who = arg(1, Args),
%%     Where = arg(2, Args),
func(#data{wl=Wl}=Data, "poll", [Who, Where]) ->
    debug("poll(~p, ~p)", [Who, Where]),
    Wul = case dict:find(Where, Wl) of
	      {ok, Value} -> Value;
	      error -> []
	  end,
    Wul2 = [{Who, now()} | [{X, Y} || {X, Y} <- Wul, X =/= Who]],
    Wl2 = dict:store(Where, Wul2, Wl),
    Data#data{wl=Wl2};

%% exec(#data{wl=Wl}=Data, "push", Args) ->
%%     Where = arg(1, Args),
%%     Func = arg(2, Args),
%%     Params = arg(3, Args),
func(#data{wl=Wl}=Data, "push", [Where, Func, Params]) ->
    debug("push(~p, ~p, ~p)", [Where, Func, Params]),
    case dict:find(Where, Wl) of
	{ok, Value} -> [cast(Who, Func, [Params]) || {Who, _} <- Value];
	error -> []
    end,
    %%?debugFmt("cmds:~p", [Cmds]),
    Data;

%% exec(#data{ul=Ul}=Data, "leave", Args) ->
%%     Who = arg(1, Args),
func(#data{ul=Ul}=Data, "leave", [Who]) ->
    debug("leave(~p)", [Who]),
    Ul2 = dict:erase(Who, Ul),
    Data#data{ul=Ul2};

%% @spec exec(Data, Func, Args) -> {Data2, Cmds, Logs} | {error, E}
func(_Data, Func, Args) ->
    debug("func(~p, ~p) not_implement", [Func, Args]),
    undefined.

%%--------------------------------------------------------------------
%% Internal functions
%%--------------------------------------------------------------------

log(L, F, A) ->
    push(?logs, io_lib:format("["++L++"]"++F,A)).

debug(F, A) -> log("DEBUG", F, A).
info(F, A) ->  log("INFO ", F, A).
error(F, A) -> log("ERROR", F, A).
warn(F, A) ->  log("WARN ", F, A).
fatal(F, A) -> log("FATAL", F, A).

cmd(Cmd) ->
    push(?cmds, Cmd).
    
cast(Who, Func, Args) -> cmd(["cast", Who, Func, Args]).
spawn(Where, Args) ->    cmd(["spawn", Where, Args]).
async(Where, Func, Args) -> cmd(["async", Where, Func, Args]).
endup() -> cmd(["endup"]).

%% ----

push(K, V) ->
    S2 = case get(K) of
	     undefined -> [V];
	     S -> [V | S]
	 end,
    put(K, S2).

flush(K) ->
    S = case erase(K) of
	    undefined -> [];
	    Any -> Any
	end,
    lists:reverse(S).

%% ----

arg(N, List) when is_list(List), length(List) >= N -> lists:nth(N, List);
arg(_, _) -> undefined.

