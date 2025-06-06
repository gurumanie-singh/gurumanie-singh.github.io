library ieee;
use ieee.std_logic_1164.all;

-- 8 to 1 Mux, N-bit

entity mux8t1_N is
	generic (N : integer := 32);
	port (
			i_D0, i_D1, i_D2, i_D3, i_D4, i_D5, i_D6, i_D7 : in std_logic_vector(N-1 downto 0); -- inputs
			i_sel : in std_logic_vector(2 downto 0); -- 3 bit select line
			o_out : out std_logic_vector(N-1 downto 0)); -- output
end mux8t1_N;

-- architecture
architecture dataflow of mux8t1_N is
begin
		
	o_out <= i_D0 when (i_sel = "000") else
	       i_D1 when (i_sel = "001") else
		   i_D2 when (i_sel = "010") else
		   i_D3 when (i_sel = "011") else
		   i_D4 when (i_sel = "100") else
		   i_D5 when (i_sel = "101") else
		   i_D6 when (i_sel = "110") else
		   i_D7;

end dataflow;