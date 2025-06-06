library ieee;
use ieee.std_logic_1164.all;

entity mux_32t1_n is
	generic (N : integer:= 32);
	port ( 
		i_D0, i_D1, i_D2, i_D3, i_D4, i_D5, i_D6,
		i_D7, i_D8, i_D9, i_D10, i_D11, i_D12, i_D13, i_D14, i_D15,
		i_D16, i_D17, i_D18, i_D19, i_D20, i_D21, i_D22, i_D23,
		i_D24, i_D25, i_D26, i_D27, i_D28, i_D29, i_D30, i_D31		: in std_logic_vector(N-1 downto 0);
		
		i_S : in std_logic_vector(4 downto 0);
		o_out : out std_logic_vector(N-1 downto 0));
end mux_32t1_n;


architecture dataflow of mux_32t1_n is

begin
n_loop : for i in 0 to N-1 generate
	o_out(i) <= i_D0(i) when (i_S = "00000") else
		    i_D1(i) when (i_S = "00001") else
		    i_D2(i) when (i_S = "00010") else
		    i_D3(i) when (i_S = "00011") else
		    i_D4(i) when (i_S = "00100") else
		    i_D5(i) when (i_S = "00101") else
		    i_D6(i) when (i_S = "00110") else
		    i_D7(i) when (i_S = "00111") else
		    i_D8(i) when (i_S = "01000") else
		    i_D9(i) when (i_S = "01001") else
		    i_D10(i) when (i_S = "01010") else
		    i_D11(i) when (i_S = "01011") else
		    i_D12(i) when (i_S = "01100") else
		    i_D13(i) when (i_S = "01101") else
		    i_D14(i) when (i_S = "01110") else
		    i_D15(i) when (i_S = "01111") else
		    i_D16(i) when (i_S = "10000") else
		    i_D17(i) when (i_S = "10001") else
		    i_D18(i) when (i_S = "10010") else
		    i_D19(i) when (i_S = "10011") else
		    i_D20(i) when (i_S = "10100") else
		    i_D21(i) when (i_S = "10101") else
		    i_D22(i) when (i_S = "10110") else
		    i_D23(i) when (i_S = "10111") else
		    i_D24(i) when (i_S = "11000") else
		    i_D25(i) when (i_S = "11001") else
		    i_D26(i) when (i_S = "11010") else
		    i_D27(i) when (i_S = "11011") else
		    i_D28(i) when (i_S = "11100") else
		    i_D29(i) when (i_S = "11101") else
		    i_D30(i) when (i_S = "11110") else
		    i_D31(i);
end generate n_loop;

end dataflow;

