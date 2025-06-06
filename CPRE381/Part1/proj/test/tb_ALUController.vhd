-------------------------------------------------------------------------
-- Gurumanie Singh
-------------------------------------------------------------------------
-- tb_ALUController.vhd
-------------------------------------------------------------------------
-- DESCRIPTION: This file contains a testbench for the ALUController unit.
-------------------------------------------------------------------------
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.std_logic_textio.all;  -- For logic types I/O
library std;
use std.env.all;                -- For hierarchical/external signals
use std.textio.all;             -- For basic I/O

entity tb_ALUController is
	

end tb_ALUController;


architecture mixed of tb_ALUController is
constant N : integer := 32; -- Constant of type integer for input/output data width. Default value is 32.

-- We will be instantiating our design under test (DUT), so we need to specify its
-- component interface.
component ALUController is
	port (	
		i_Function 	: in std_logic_vector(5 downto 0);
		i_ALUOp 	: in std_logic_vector(2 downto 0);
		o_ALUControl	: out std_logic_vector(3 downto 0)
		); 	
end component;


-- Input and output signals as needed.
signal s_Function	: std_logic_vector(5 downto 0);
signal s_ALUOp   	: std_logic_vector(2 downto 0);
signal s_ALUControl	: std_logic_vector(3 downto 0);

begin

  -- TODO: Actually instantiate the component to test and wire all signals to the corresponding
  -- input or output. Note that DUT0 is just the name of the instance that can be seen 
  -- during simulation. What follows DUT0 is the entity name that will be used to find
  -- the appropriate library component during simulation loading.
  DUT0: ALUController
  port map(
            i_Function			=> s_Function,
            i_ALUOp			=> s_ALUOp,
            o_ALUControl		=> s_ALUControl
	    );
  --You can also do the above port map in one line using the below format: http://www.ics.uci.edu/~jmoorkan/vhdlref/compinst.html
  

  
  -- Testbench process  
  P_TB: process
  begin

	-- Test 1
	s_Function 	<= "100000"; 
	s_ALUOp 	<= "000";
	wait for 10 ns;
	-- ALUControl should be 0010

	-- Test 2
	s_Function	<= "100000";
	s_ALUOp		<= "011";
	wait for 10 ns;
	-- ALUControl should be 0000

	-- Test 3
	s_Function	<= "000000";
	s_ALUOp		<= "000";
	wait for 10 ns;
	-- ALUControl should be 0000
	-- Not incorporated shift yet, so this is fine

	-- Test 4
	s_Function	<= "111111";
	s_ALUOp		<= "111";
	wait for 10 ns;
	-- ALUControl should be 0101
	
    wait;
  end process;
  
end mixed;