library ieee;
use ieee.std_logic_1164.all;

-- Created by : Dawud Benedict
--
-- Pipeline to send information from Instruction Fetch stage to Instruction Decode. 
entity Pipeline_IF_ID is
	port (	
		i_CLK		: in std_logic;
		i_RST		: in std_logic;
		i_flush		: in std_logic;
		i_stall		: in std_logic;
		i_PCAdd4	: in std_logic_vector(31 downto 0);
		i_Inst		: in std_logic_vector(31 downto 0);
		o_PCAdd4	: out std_logic_vector(31 downto 0);
		o_Inst		: out std_logic_vector(31 downto 0)
		); 	
end Pipeline_IF_ID;


-------------  architecture --------------
architecture structural of Pipeline_IF_ID is

component reg_N is
	generic( N : integer := 32);
	port (
		i_data   : in std_logic_vector(N-1 downto 0);
		i_writeEn: in std_logic;
		i_reset  : in std_logic;
		i_clock  : in std_logic;
		o_output : out std_logic_vector(N-1 downto 0));
end component;

signal s_reset : std_logic;
signal s_flush : std_logic;
signal s_WE	   : std_logic; -- write enable. Disable write if stall signal is set.

begin

-- reset occurs on synch flush signal or asynch reset signal
with (rising_edge(i_CLK)) select
	s_flush <= i_flush when true,
			   '0' when others;

s_reset <= s_flush OR i_RST;

s_WE <= NOT i_stall;

reg1: reg_N
	port map (	i_data   => i_PCAdd4,
			i_writeEn=> s_WE,
			i_reset  => s_reset,
			i_clock  => i_CLK,
			o_output => o_PCAdd4
		);
reg2: reg_N
	port map (	i_data 	 => i_Inst,
			i_writeEn=> s_WE,
			i_reset	 => s_reset,
			i_clock	 => i_CLK,
			o_output => o_Inst
		);

end structural;