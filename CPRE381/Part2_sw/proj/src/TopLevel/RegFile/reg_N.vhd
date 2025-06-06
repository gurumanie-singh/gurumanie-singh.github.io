library ieee;
use ieee.std_logic_1164.all;

entity reg_N is
	generic( N : integer := 32);
	port (
		i_data   : in std_logic_vector(N-1 downto 0);
		i_writeEn: in std_logic;
		i_reset  : in std_logic;
		i_clock  : in std_logic;
		o_output : out std_logic_vector(N-1 downto 0));
end reg_N;

-- architecture
architecture structural of reg_N is

component dffg is
  port(i_CLK        : in std_logic;     -- Clock input
       i_RST        : in std_logic;     -- Reset input
       i_WE         : in std_logic;     -- Write enable input
       i_D          : in std_logic;     -- Data value input
       o_Q          : out std_logic);   -- Data value output
end component;

-- loop all bits
begin
n_loop: for i in 0 to N-1 generate

	d_flip_flop: dffg port map ( i_CLK => i_clock,
			     i_RST => i_reset,
			     i_WE => i_writeEn,
			     i_D => i_data(i),
			     o_Q => o_output(i));
end generate n_loop;

end structural;
