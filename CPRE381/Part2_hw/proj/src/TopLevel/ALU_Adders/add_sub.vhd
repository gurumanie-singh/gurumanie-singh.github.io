library ieee;
use ieee.std_logic_1164.all;

entity add_sub is
	generic (N : integer := 32);
	port (  i_X, i_Y : in std_logic_vector(N-1 downto 0);
			nAdd_Sub : in std_logic;							-- if set, i_X - i_Y
			o_S	 : out std_logic_vector(N-1 downto 0);
			o_C  : out std_logic;	 -- carry out
			o_OvF: out std_logic );  -- overflow
end add_sub;

-- architecture
architecture structural of add_sub is

component ripple_carry_adder is
	generic (N : integer := 32);
	port (  i_X, i_Y : in std_logic_vector(N-1 downto 0);
			i_C	 : in std_logic;
			o_S	 : out std_logic_vector(N-1 downto 0);
			o_Cprev : out std_logic;
			o_C	 : out std_logic );
end component;

component onescomp is
	generic ( N: integer := 32);
	port ( i_in: in std_logic_vector(N-1 downto 0);
	       o_O: out std_logic_vector(N-1 downto 0));
end component;

component mux2t1_N is
  generic(N : integer := 32); 
  port(i_S          : in std_logic;
       i_D0         : in std_logic_vector(N-1 downto 0);
       i_D1         : in std_logic_vector(N-1 downto 0);
       o_O          : out std_logic_vector(N-1 downto 0));
end component;

-- signals
signal s_inv_y, s_mux : std_logic_vector(N-1 downto 0);
signal s_Cprev, s_C : std_logic;

-- if nAdd_Sub is 1 then invert Y
begin

inverter: onescomp port map ( i_in => i_Y,
			      o_O => s_inv_y);

mux : mux2t1_N port map ( i_S => nAdd_Sub,
			  i_D0 => i_Y,
			  i_D1 => s_inv_y,
			  o_O => s_mux );

adder : ripple_carry_adder port map ( i_X => i_X,
				      i_Y => s_mux,
				      i_C => nAdd_Sub,
				      o_S => o_S,
					  o_Cprev => s_Cprev,
				      o_C => s_C );

o_OvF <= s_Cprev XOR s_C;

o_C <= s_C;


end structural;