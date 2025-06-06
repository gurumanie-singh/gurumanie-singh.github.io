-- 4 to 1 Multiplexer

library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

entity mux4t1_N is
	generic (N : integer := 32);
	port (	
			i_D0, i_D1, i_D2, i_D3 : in std_logic_vector(N-1 downto 0); -- inputs
			i_S : in std_logic_vector(1 downto 0); -- select line
			o_O : out std_logic_vector(N-1 downto 0)); -- output
end mux4t1_N;

architecture dataflow of mux4t1_N is
begin
	o_O <= i_D0 when (i_S = "00") else
	       i_D1 when (i_S = "01") else
		   i_D2 when (i_S = "10") else
		   i_D3;

end dataflow;