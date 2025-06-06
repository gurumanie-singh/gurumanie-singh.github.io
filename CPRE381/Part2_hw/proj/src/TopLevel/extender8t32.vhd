library ieee;
use ieee.std_logic_1164.all;

-- Created by : Dawud Benedict
--
-- Extends a 8-bit vector to a 32-bit vector. Can be signed extended or zero extended. 
entity extender8t32 is
	port (	i_signSelect 	: in std_logic;
		i_imm 		: in std_logic_vector(7 downto 0);
		o_out 		: out std_logic_vector(31 downto 0));
end extender8t32;

architecture dataflow of extender8t32 is

-- signal
signal s_oneExtend : std_logic; -- set if ones should be added to the front of the imm

begin

	s_oneExtend <= i_signSelect AND i_imm(7);

	o_out 	<= 	(x"000000" & i_imm) when (s_oneExtend = '0') else
				(x"FFFFFF" & i_imm);

end dataflow;