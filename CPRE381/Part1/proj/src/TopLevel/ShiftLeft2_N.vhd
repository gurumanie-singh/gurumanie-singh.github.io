library ieee;
use ieee.std_logic_1164.all;

entity ShiftLeft2_N is
generic(in_N : integer := 32;
	out_N: integer := 32);

	port (	i_input : in std_logic_vector(in_N - 1 downto 0);
		o_out : out std_logic_vector(out_N - 1 downto 0));
end ShiftLeft2_N;

architecture dataflow of ShiftLeft2_N is

-- signal
signal output : std_logic_vector(in_N + 1 downto 0);

begin

	output 	<= i_input & "00";
	o_out 	<= output(out_N - 1 downto 0);

end dataflow;