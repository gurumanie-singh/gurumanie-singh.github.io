-------------------------------------------------------------------------
-- Dawud Benedict
-- Department of Electrical and Computer Engineering
-- Iowa State University
-------------------------------------------------------------------------

library IEEE;
use IEEE.std_logic_1164.all;

entity tb_regFile is
  generic( gCLK_HPER : time := 10 ns);
	
end tb_regFile;

architecture behavior of tb_regFile is
  
  -- Calculate the clock period as twice the half-period
  constant cCLK_PER  : time := gCLK_HPER * 2;

component regFile is
	port (	i_rt : in std_logic_vector(4 downto 0);  -- read reg 0 select
		i_rs : in std_logic_vector(4 downto 0);  -- read reg 1 select
		i_rd: in std_logic_vector(4 downto 0);  -- write reg select  (set to 0 for no writing)
		i_data: in std_logic_vector(31 downto 0); -- write data
		i_RegWrite: in std_logic;
		i_clk, i_rst: in std_logic;	 	  -- clock and reset
		o_rt : out std_logic_vector(31 downto 0); -- output of reg 0
		o_rs : out std_logic_vector(31 downto 0)); -- output of reg 1
end component;


  -- signals
 signal s_irt, s_irs, s_ird : std_logic_vector(4 downto 0); -- reg select lines
 signal s_ort, s_ors, s_data: std_logic_vector(31 downto 0); -- data input and outputs
 signal s_clk, s_rst, s_RegWrite	    : std_logic;


-- port map
begin
my_regFile: regFile port map (	i_rt => s_irt,
				i_rs => s_irs,
				i_rd => s_ird,
				i_data => s_data,
				i_RegWrite => s_RegWrite,
				i_clk => s_clk,
				i_rst => s_rst,
				o_rt => s_ort,
				o_rs => s_ors );


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

  s_RegWrite <= '1';

  -- test 1: reset
  s_rst <= '1';
  s_irt <= "00000";
  s_irs <= "11111";
  s_ird <= "00000";
  s_data <= x"FFFFFFFF";
  wait for cCLK_PER;

  -- Expected : o_rt = 0x0
  --		o_rs = 0x0

  -- test 2: try to set 0 reg
  s_rst <= '0';
  s_irt <= "00000";
  s_irs <= "11111";
  s_ird <= "00000";
  s_data <= x"FFFFFFFF";
  wait for cCLK_PER;
  -- Expected : o_rt = 0x0
  --		o_rs = 0x0

  -- test 3: set reg 1
  s_rst <= '0';
  s_irt <= "00001";
  s_irs <= "11111";
  s_ird <= "00001";
  s_data <= x"FFFFFFFF";
  s_RegWrite <= '0';
  wait for cCLK_PER;
  s_RegWrite <= '1';
  -- Expected : o_rt = 0x0
  --		o_rs = 0x0

  -- test 4: set reg 2, still looking at reg 1
  s_rst <= '0';
  s_irt <= "00001";
  s_irs <= "00000";
  s_ird <= "00010";
  s_data <= x"12345678";
  wait for cCLK_PER;
  -- Expected : o_rt = 0xFFFFFFFF
  --		o_rs = 0x0

  -- test 5: view $1 and $2
  s_rst <= '0';
  s_irt <= "00001";
  s_irs <= "00010";
  s_ird <= "00000";
  s_data <= x"FFFFFFFF";
  wait for cCLK_PER;
  -- Expected : o_rt = 0xFFFFFFFF
  --		o_rs = 0x12345678

  -- test 6: set reg 3
  s_rst <= '0';
  s_irt <= "00001";
  s_irs <= "00010";
  s_ird <= "00011";
  s_data <= x"FFFFFFFF";
  wait for cCLK_PER;
  -- Expected : o_rt = 0xFFFFFFFF
  --		o_rs = 0x12345678

  -- test 7: read $0 and $2
  s_rst <= '0';
  s_irt <= "00000";
  s_irs <= "00010";
  s_ird <= "00000";
  s_data <= x"FFFFFFFF";
  wait for cCLK_PER;
  -- Expected : o_rt = 0x0
  --		o_rs = 0x12345678

  -- test 8: set $30, read $3 and $30
  s_rst <= '0';
  s_irt <= "00011";
  s_irs <= "11110";
  s_ird <= "11110";
  s_data <= x"ABCDEF00";
  s_RegWrite <= '0';
  wait for cCLK_PER;
  s_RegWrite <= '1';
  -- Expected : o_rt = 0xFFFFFFFF
  --		o_rs = 0x0

  -- test 9: read $3 and $3
  s_rst <= '0';
  s_irt <= "00011";
  s_irs <= "00011";
  s_ird <= "00000";
  s_data <= x"ABCDEF00";
  wait for cCLK_PER;
  -- Expected : o_rt = 0xFFFFFFFF
  --		o_rs = 0xFFFFFFFF


  wait;
  end process;
  
end behavior;