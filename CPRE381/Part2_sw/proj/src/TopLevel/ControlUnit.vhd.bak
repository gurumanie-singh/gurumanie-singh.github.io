library ieee;
use ieee.std_logic_1164.all;

entity ControlUnit is
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
end ControlUnit;


-------------  architecture --------------
architecture dataflow of ControlUnit is

begin
with i_opcode select
	o_RegDst <= "01" when "000000",
		    "10" when "000011",
		    "00" when others; 	

with i_opcode select
	o_Jump <= '1' when "000010",
		  '1' when "000011",
		  '0' when others;

with i_opcode select
	o_Branch <= '1' when "000100",
		    '1' when "000101",
		    '0' when others;
	
	-- o_MemRead <= 
with i_opcode select
	o_MemToReg <= "01" when "100011",
		      "11" when "100000",
		      "10" when "100001",
		      "11" when "100100",
		      "10" when "100101",
		      "00" when others;

with i_opcode select
	o_SignedLoad <= '1' when "100000",	-- lb
			'1' when "100001",	-- lh
			'1' when "100011",	-- lw
			'0' when "100100",	-- lbu
			'0' when "100101",	-- lhu
			'0' when others;
			


-- ALUOp:
-- 	if R-type -> ALUOp = 000
--  else ADD -> 001
--		SUB -> 010
--		AND -> 011
-- 		OR  -> 100
--		--- -> 101
--		XOR -> 110
-- 		Less -> 111
with i_opcode select
	o_ALUOp <= 	"000" when "000000",
				"001" when "001000",
				"001" when "001001",
				"011" when "001100",
				"011" when "001111",
				"001" when "100011",
				"110" when "001110",
				"100" when "001101",
				"111" when "001010",
				"001" when "101011",
				"010" when "000100",
				"010" when "000101",
				"001" when "100000",
				"001" when "100001",
				"001" when "100100",
				"001" when "100101",
				"101" when others;


with i_opcode select
	o_MemWrite <= '1' when "101011",
		      '0' when others;

with i_opcode select
	o_ALUSrc <= '1' when "001000",
		    '1' when "001001",
		    '1' when "001100",
		    '1' when "001111",
		    '1' when "100011",
		    '1' when "001110",
		    '1' when "001101",
		    '1' when "001010",
		    '1' when "101011",
		    '1' when "100000",
		    '1' when "100001",
		    '1' when "100100",
		    '1' when "100101",
		    '0' when others;

with i_opcode select	    
	-- jr not added inside yet, need to figure out
	o_RegWrite <= '0' when "101011",
		      '0' when "000100",
		      '0' when "000101",
		      '0' when "000010",
		      '1' when others;

with i_opcode select
	o_SignExt <= '0' when "001100",
		     '0' when "001110",
		     '0' when "001101",
		     '1' when others;

with i_opcode select
	o_Halt <= '1' when "010100",
		  '0' when others;
		      
with i_opcode select
	o_luiSelect <= 	"01" when "001111",
			"10" when "000011",
		       	"00" when others;

with i_opcode select
	o_checkOvFl <= '1' when "001000",
		       '0' when others;

with i_opcode select
	o_equalSelect <= '1' when "000100",
					 '0' when others;

end dataflow;