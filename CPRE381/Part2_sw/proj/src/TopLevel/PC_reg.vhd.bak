library ieee;
use ieee.std_logic_1164.all;

entity PC_reg is
	generic( N : integer := 32);
	port (
		i_data   : in std_logic_vector(N-1 downto 0);
		i_writeEn: in std_logic;
		i_reset  : in std_logic;
		i_clock  : in std_logic;
		o_output : out std_logic_vector(N-1 downto 0));
end PC_reg;

-- architecture
architecture structural of PC_reg is

component dffg is
  port(i_CLK        : in std_logic;     -- Clock input
       i_RST        : in std_logic;     -- Reset input
       i_WE         : in std_logic;     -- Write enable input
       i_D          : in std_logic;     -- Data value input
       o_Q          : out std_logic);   -- Data value output
end component;

signal s_reset : std_logic; -- does nothing.
signal s_WE	   : std_logic;
signal s_data : std_logic_vector(N-1 downto 0);

-- loop all bits
begin

with i_reset select
	s_data <= x"00400000" when '1',
				i_data when others;

with i_reset select
	s_WE <= '1' when '1',
			i_writeEn when others;

n_loop: for i in 0 to N-1 generate

	d_flip_flop: dffg port map ( i_CLK => i_clock,
			     i_RST => s_reset,
			     i_WE => s_WE,
			     i_D => s_data(i),
			     o_Q => o_output(i));
end generate n_loop;

end structural;