library ieee;
use ieee.std_logic_1164.all;

entity ALUController is
	port (	
		i_Function 	: in std_logic_vector(5 downto 0);
		i_ALUOp 	: in std_logic_vector(2 downto 0);
		o_ALUControl	: out std_logic_vector(3 downto 0);
		o_checkOvFl 	: out std_logic;
		o_jrSelect		: out std_logic;			-- uses funct to set PC if inst is jr
		o_regShift		: out std_logic			-- use funct to select if reg shift or not
		); 	
end ALUController;


-------------  architecture --------------
architecture dataflow of ALUController is

signal Function_out : std_logic_vector(3 downto 0);
signal s_checkOvFl, s_jrSelect, s_isRtype : std_logic;

begin

-- not included shifts yet
with i_Function select
	Function_out <= "0010" when "100000",
			"0010" when "100001",
			"0000" when "100100",
			"0011" when "100111",
			"0100" when "100110",
			"0001" when "100101",
			"1101" when "101010",
			"1010" when "100010",
			"1010" when "100011",
			"0110" when "000000",
			"0110" when "000100",
			"1111" when "000011",
			"1111" when "000111",
			"0111" when "000010",
			"0111" when "000110",
			"0000" when others;

with i_ALUOp select
	o_ALUControl <= "0010" when "001",
			  "0000" when "011",
			  "0100" when "110",
			  "0001" when "100",
			  "1101" when "111",
			  "1010" when "010",
			  Function_out when others;

with i_Function select
	s_checkOvFl <= '1' when "100000",
				   '1' when "100010",
					'0' when others;

with i_Function select
	s_jrSelect <= 	'1' when "001000",		
					'0' when others;

with i_Function select
	o_regShift <= 	'1' when "000100",
					'1' when "000111",
					'1' when "000110",
					'0' when others;

with i_ALUOp select
	s_isRtype <=	'1' when "000",
					'0' when others;

o_checkOvFl <= s_checkOvFl AND s_isRtype;

o_jrSelect <= s_jrSelect AND s_isRtype;


end dataflow;