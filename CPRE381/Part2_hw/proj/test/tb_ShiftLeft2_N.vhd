-------------------------------------------------------------------------
-- Gurumanie Singh
-------------------------------------------------------------------------
-- tb_ShiftLeft2_N.vhd
-------------------------------------------------------------------------
-- DESCRIPTION: This file contains a testbench for the ShiftLeft2_N unit.
-------------------------------------------------------------------------
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.std_logic_textio.all;  -- For logic types I/O
library std;
use std.env.all;                -- For hierarchical/external signals
use std.textio.all;             -- For basic I/O

entity tb_ShiftLeft2_N is

end tb_ShiftLeft2_N;


architecture mixed of tb_ShiftLeft2_N is
-- We will be instantiating our design under test (DUT), so we need to specify its
-- component interface.
component ShiftLeft2_N is
generic(in_N : integer := 32;
	out_N: integer := 32);

	port (	i_input : in std_logic_vector(in_N - 1 downto 0);
		o_out : out std_logic_vector(out_N - 1 downto 0));
end component;


-- Input and output signals as needed.
signal s_input1		: std_logic_vector(25 downto 0);
signal s_output1   	: std_logic_vector(27 downto 0);
signal s_input2		: std_logic_vector(31 downto 0);
signal s_output2   	: std_logic_vector(31 downto 0);

begin

  -- TODO: Actually instantiate the component to test and wire all signals to the corresponding
  -- input or output. Note that DUT0 is just the name of the instance that can be seen 
  -- during simulation. What follows DUT0 is the entity name that will be used to find
  -- the appropriate library component during simulation loading.
  DUT0: ShiftLeft2_N
  generic map(
		in_N 	=> 26,
		out_N 	=> 28
		)
  port map(
            i_input			=> s_input1,
            o_out			=> s_output1
	    );

  DUT1: ShiftLeft2_N
 generic map(
		in_N 	=> 32,
		out_N 	=> 32
		)
  port map(
            i_input			=> s_input2,
            o_out			=> s_output2
	    );
  --You can also do the above port map in one line using the below format: http://www.ics.uci.edu/~jmoorkan/vhdlref/compinst.html
  

  
  -- Testbench process  
  P_TB: process
  begin

	-- Test 1
	s_input1 	<= "11111111111111111111111111"; 
	s_input2 	<= x"FFFFFFFF";
	wait for 10 ns;

	-- Test 2
	s_input1 	<= "10000000000000000000000000"; 
	s_input2 	<= x"40000000";
	wait for 10 ns;

    wait;
  end process;
  
end mixed;