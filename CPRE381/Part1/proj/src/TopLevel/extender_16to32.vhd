library ieee;
use ieee.std_logic_1164.all;

entity extender_16to32 is
	port (	i_signSelect : in std_logic;
			i_imm : in std_logic_vector(15 downto 0);
			o_out : out std_logic_vector(31 downto 0));
end extender_16to32;

architecture dataflow of extender_16to32 is

-- signal
signal s_oneExtend : std_logic; -- set if ones should be added to the front of the imm

begin

	s_oneExtend <= i_signSelect AND i_imm(15);

	o_out 	<= 	(x"0000" & i_imm) when (s_oneExtend = '0') else
				(x"FFFF" & i_imm);

end dataflow;
