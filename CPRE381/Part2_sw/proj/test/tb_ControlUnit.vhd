-------------------------------------------------------------------------
-- Gurumanie Singh
-------------------------------------------------------------------------
-- tb_ControlUnit.vhd
-------------------------------------------------------------------------
-- DESCRIPTION: This file contains a testbench for the ControlUnit unit.
-------------------------------------------------------------------------
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.std_logic_textio.all;  -- For logic types I/O
library std;
use std.env.all;                -- For hierarchical/external signals
use std.textio.all;             -- For basic I/O

entity tb_ControlUnit is

end tb_ControlUnit;


architecture mixed of tb_ControlUnit is
-- We will be instantiating our design under test (DUT), so we need to specify its
-- component interface.
component ControlUnit is
	port (	
		i_opcode 	: in std_logic_vector(5 downto 0);
		o_RegDst 	: out std_logic_vector(1 downto 0);
		o_Jump		: out std_logic;
		o_Branch 	: out std_logic;
		-- o_MemRead 	: out std_logic;
		o_MemToReg 	: out std_logic_vector(1 downto 0);
		o_ALUOp 	: out std_logic_vector(2 downto 0);
		o_MemWrite 	: out std_logic;
		o_ALUSrc 	: out std_logic;
		o_RegWrite 	: out std_logic;
		o_SignExt	: out std_logic;
		o_Halt		: out std_logic;
		o_luiSelect 	: out std_logic_vector(1 downto 0);
		o_checkOvFl 	: out std_logic;
		o_SignedLoad 	: out std_logic;
		o_equalSelect	: out std_logic); 	
end component;


-- Input and output signals as needed.
signal s_opcode		: std_logic_vector(5 downto 0);
signal s_RegDst		: std_logic_vector(1 downto 0);
signal s_Jump		: std_logic;
signal s_Branch   	: std_logic;
signal s_MemToReg	: std_logic_vector(1 downto 0);
signal s_ALUOp		: std_logic_vector(2 downto 0);
signal s_MemWrite	: std_logic;
signal s_ALUSrc		: std_logic;
signal s_RegWrite	: std_logic;
signal s_SignExt	: std_logic;
signal s_Halt		: std_logic;
signal s_luiSelect	: std_logic_vector(1 downto 0);
signal s_checkOvFl	: std_logic;
signal s_SignedLoad	: std_logic;
signal s_equalSelect	: std_logic;

begin

  -- TODO: Actually instantiate the component to test and wire all signals to the corresponding
  -- input or output. Note that DUT0 is just the name of the instance that can be seen 
  -- during simulation. What follows DUT0 is the entity name that will be used to find
  -- the appropriate library component during simulation loading.
  DUT0: ControlUnit
  port map(
		i_opcode		=> s_opcode,
            	o_RegDst		=> s_RegDst,
            	o_Jump			=> s_Jump,
		o_Branch		=> s_Branch,
		o_MemToReg		=> s_MemToReg,
		o_ALUOp			=> s_ALUOp,
		o_MemWrite		=> s_MemWrite,
		o_ALUSrc		=> s_ALUSrc,
		o_RegWrite		=> s_RegWrite,
		o_SignExt		=> s_SignExt,
		o_Halt			=> s_Halt,
		o_luiSelect		=> s_luiSelect,
		o_checkOvFl		=> s_checkOvFl,
		o_SignedLoad		=> s_SignedLoad,
		o_equalSelect		=> s_equalSelect
	    );
  --You can also do the above port map in one line using the below format: http://www.ics.uci.edu/~jmoorkan/vhdlref/compinst.html
  

  
  -- Testbench process  
  P_TB: process
  begin

	-- add
	s_Opcode 		<= "000000"; 
	wait for 10 ns;

	-- addi
	s_Opcode 		<= "001000"; 
	wait for 10 ns;

	-- addiu
	s_Opcode 		<= "001001"; 
	wait for 10 ns;

	-- andi
	s_Opcode 		<= "001100"; 
	wait for 10 ns;

	-- beq
	s_Opcode 		<= "000100"; 
	wait for 10 ns;

	-- bne
	s_Opcode 		<= "000101"; 
	wait for 10 ns;

	-- j
	s_Opcode 		<= "000010"; 
	wait for 10 ns;

	-- jal
	s_Opcode 		<= "000011"; 
	wait for 10 ns;

	-- lb
	s_Opcode 		<= "100000"; 
	wait for 10 ns;

	-- lbu
	s_Opcode 		<= "100100"; 
	wait for 10 ns;

	-- lh
	s_Opcode 		<= "100001"; 
	wait for 10 ns;

	-- lhu
	s_Opcode 		<= "100101"; 
	wait for 10 ns;

	-- lui
	s_Opcode 		<= "001111"; 
	wait for 10 ns;

	-- lw
	s_Opcode 		<= "100011"; 
	wait for 10 ns;

	-- ori
	s_Opcode 		<= "001101"; 
	wait for 10 ns;

	-- slti
	s_Opcode 		<= "001010"; 
	wait for 10 ns;

	-- sw
	s_Opcode 		<= "101011"; 
	wait for 10 ns;

	-- xori
	s_Opcode 		<= "001110"; 
	wait for 10 ns;
	
    wait;
  end process;
  
end mixed;
