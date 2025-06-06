library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.std_logic_textio.all;  -- For logic types I/O
library std;
use std.env.all;                -- For hierarchical/external signals
use std.textio.all;             -- For basic I/O

entity tb_mux2t1_N is
	generic(wait_time: time := 10 ns;
		  N: integer := 16);

end tb_mux2t1_N;

architecture mixed of tb_mux2t1_N is

component mux2t1_N is
  generic(N : integer := 16); -- Generic of type integer for input/output data width. Default value is 32.
  port(i_S          : in std_logic;
       i_D0         : in std_logic_vector(N-1 downto 0);
       i_D1         : in std_logic_vector(N-1 downto 0);
       o_O          : out std_logic_vector(N-1 downto 0));

end component;

-- define input/output signals, pre-set to 0
signal s_iD0: std_logic_vector(N-1 downto 0);
signal s_iD1: std_logic_vector(N-1 downto 0);
signal s_iS: std_logic;
signal s_O: std_logic_vector(N-1 downto 0);

begin

-- map signals to mux ports
my_mux: mux2t1_N
port map ( i_D0 => s_iD0,
	   i_D1 => s_iD1,
	   i_S => s_iS,
	   o_O => s_O);

-- begin test cases
TEST: process
begin

-- test 1
s_iD0 <= x"0000"; -- 10 in hex
s_iD1 <= x"00FF"; -- 255 in hex
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 0x0000

-- test 2
s_iD0 <= x"000A"; -- 10 in hex
s_iD1 <= x"0000"; -- 0 in hex
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 0x000A

-- test 3
s_iD0 <= x"FFFF"; -- -1 in hex
s_iD1 <= x"0000"; -- 0 in hex	
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 0xFFFF

-- test 4
s_iD0 <= x"1234";
s_iD1 <= x"5678";
s_iS <= '0';
wait for wait_time;
-- Expected: s_O = 0x1234

-- test 5

s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 0x5678

-- test 6
s_iD0 <= x"0000";
s_iD1 <= x"5678";
s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 0x5678

-- test 7
s_iD0 <= x"0000";
s_iD1 <= x"ABCD";
s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 0xABCD

-- test 8
s_iD0 <= x"0001";
s_iD1 <= x"0001";
s_iS <= '1';
wait for wait_time;
-- Expected: s_O = 0x0001


end process;

end mixed;