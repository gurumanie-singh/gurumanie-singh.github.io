-------------------------------------------------------------------------
-- Dawud Benedict
-- Department of Electrical and Computer Engineering
-- Iowa State University
-------------------------------------------------------------------------


-- tb_dffg.vhd
-------------------------------------------------------------------------
-- DESCRIPTION: This file contains a simple VHDL testbench for the
-- edge-triggered regster with parallel access and reset.
-------------------------------------------------------------------------

library IEEE;
use IEEE.std_logic_1164.all;

entity tb_reg_N is
  generic( gCLK_HPER   : time := 10 ns);
	
end tb_reg_N;

architecture behavior of tb_reg_N is
  
  -- Calculate the clock period as twice the half-period
  constant cCLK_PER  : time := gCLK_HPER * 2;
  constant N : integer := 32;


component reg_N
	generic( N : integer := 32);
	port (
		i_data   : in std_logic_vector(N-1 downto 0);
		i_writeEn: in std_logic;
		i_reset  : in std_logic;
		i_clock  : in std_logic;
		o_output : out std_logic_vector(N-1 downto 0));
end component;

  -- signals
  signal s_CLK, s_RST, s_WE  : std_logic;
  signal s_D, s_out : std_logic_vector(N-1 downto 0);


-- port map
begin
my_reg: reg_N port map (
			 i_data => s_D,
			 i_writeEn => s_WE,
			 i_reset => s_RST,
			 i_clock => s_CLK,
			 o_output => s_out);


  -- This process sets the clock value (low for gCLK_HPER, then high
  -- for gCLK_HPER). Absent a "wait" command, processes restart 
  -- at the beginning once they have reached the final statement.
  
P_CLK: process
  begin
    s_CLK <= '0';
    wait for gCLK_HPER;
    s_CLK <= '1';
    wait for gCLK_HPER;
  end process;
  
  -- Testbench process  
  tset: process
  begin

    -- Reset
    s_RST <= '1';
    s_WE  <= '0';
    s_D   <= x"FFFFFFFF";
    wait for cCLK_PER;
	-- expected: output = 0x00000000

    -- Store 
    s_RST <= '0';
    s_WE  <= '1';
    s_D   <= x"0000FFFF";
    wait for cCLK_PER;  
	-- Expected: output = 0x0000FFFF

    -- Keep
    s_RST <= '0';
    s_WE  <= '0';
    s_D   <= x"00001111";
    wait for cCLK_PER;  
	-- Expected: output = 0x0000FFFF

    -- Keep
    s_RST <= '0';
    s_WE  <= '0';
    s_D   <= x"FFFFFFFF";
    wait for cCLK_PER;  
	-- Expected: output = 0x0000FFFF

    -- Store
    s_RST <= '0';
    s_WE  <= '1';
    s_D   <= x"12345678";
    wait for cCLK_PER;  
	-- Expected: output = 0x12345678

    -- Keep
    s_RST <= '0';
    s_WE  <= '0';
    s_D   <= x"ABCDEF00";
    wait for cCLK_PER;  
	-- Expected: output = 0x12345678

    -- Reset
    s_RST <= '1';
    s_WE  <= '0';
    s_D   <= x"12345678";
    wait for cCLK_PER;
	-- expected: output = 0x00000000

  wait;
  end process;
  
end behavior;