library IEEE;
use ieee.std_logic_1164.all;

entity full_adder is
	port (
		i_X, i_Y, i_C : in std_logic;
		o_S, o_C      : out std_logic);
end full_adder;

-- architecture
architecture dataflow of full_adder is



-- signals
signal x_xor_y, x_and_y, xy_and_c : std_logic;


begin

x_xor_y <= i_X XOR i_Y;

o_S <= x_xor_y XOR i_C;

x_and_y <= i_X AND i_Y;

xy_and_c <= x_xor_y AND i_C;

o_C <= x_and_y OR xy_and_c;

end dataflow;
