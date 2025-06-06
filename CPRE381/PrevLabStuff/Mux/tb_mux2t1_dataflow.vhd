library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.std_logic_textio.all;  -- For logic types I/O
library std;
use std.env.all;                -- For hierarchical/external signals
use std.textio.all;             -- For basic I/O


entity tb_mux2t1_dataflow is
	generic(wait_time: time := 10 ns);

end tb_mux2t1_dataflow;

architecture mixed of tb_mux2t1_dataflow is

-- define mux2t1
component mux2t1_dataflow is
port(   i_D0 : in std_logic;
	i_D1 : in std_logic;
	i_S : in std_logic;
	o_O : out std_logic);
end component;

-- define input/output signals, pre-set to 0
signal s_iD0: std_logic := '0';
signal s_iD1: std_logic := '0';
signal s_iS: std_logic := '0';
signal s_O: std_logic;

begin

-- map signals to mux ports
my_mux: mux2t1_dataflow
port map ( i_D0 => s_iD0,
	   i_D1 => s_iD1,
	   i_S => s_iS,
	   o_O => s_O);

-- begin test cases
TEST: process
begin

-- test 1
s_iD0 <= '0';
s_iD1 <= '0';
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 0

-- test 2
s_iD0 <= '1';
s_iD1 <= '0';
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 1

-- test 3
s_iD0 <= '0';
s_iD1 <= '1';
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 0

-- test 4
s_iD0 <= '1';
s_iD1 <= '1';
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 1

-- test 5
s_iD0 <= '0';
s_iD1 <= '0';
s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 0

-- test 6
s_iD0 <= '1';
s_iD1 <= '0';
s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 0

-- test 7
s_iD0 <= '0';
s_iD1 <= '1';
s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 1

-- test 8
s_iD0 <= '1';
s_iD1 <= '1';
s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 1


-- expected pattern for s_O: 0 0 1 0 1 1

end process;

end mixed;