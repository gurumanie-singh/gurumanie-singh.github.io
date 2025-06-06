library ieee;
use ieee.std_logic_1164.all;

entity ripple_carry_adder is
	generic (N : integer := 32);
	port (  i_X, i_Y : in std_logic_vector(N-1 downto 0);
		i_C	 : in std_logic;
		o_S	 : out std_logic_vector(N-1 downto 0);
		o_C	 : out std_logic );
end ripple_carry_adder;

-- architecture
architecture structural of ripple_carry_adder is

component full_adder is
	port (	i_X, i_Y, i_C : in std_logic;
		o_S, o_C      : out std_logic);
end component;

-- signal for carry values
signal s_carry: std_logic_vector(N downto 0);

-- add each bit using ripple carry
begin

-- set input carry
s_carry(0) <= i_C;

-- loop through N bits
N_loop: for i in 0 to N-1 generate

	full_add : full_adder port map ( i_X => i_X(i),
					 i_Y => i_Y(i),
					 i_C => s_carry(i),
					 o_S => o_S(i),
					 o_C => s_carry(i+1));

end generate N_loop;

-- set final carry value
o_C <= s_carry(N);

end structural;
