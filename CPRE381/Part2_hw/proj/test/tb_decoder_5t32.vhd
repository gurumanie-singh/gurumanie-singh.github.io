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

entity tb_decoder_5t32 is
	
end tb_decoder_5t32;

architecture test of tb_decoder_5t32 is

component decoder_5t32 is
	port ( i_in  : in std_logic_vector(4 downto 0); -- 5 bit input select
	       i_en : in std_logic;
	       o_out : out std_logic_vector(31 downto 0)); -- 2^5 output
end component;

  -- signals
  signal s_in  : std_logic_vector(4 downto 0);
  signal s_RegWrite : std_logic;
  signal s_out : std_logic_vector(31 downto 0);


-- port map
begin
decoder: decoder_5t32 port map (
			 i_in => s_in,
			 i_en => s_RegWrite,
			 o_out => s_out);

  
  -- Testbench process  
  tset: process
  begin

  s_RegWrite <= '1';
  -- 0
  s_in <= "00000";
  wait for 10 ns;

  -- 1
  s_in <= "00001";
  s_RegWrite <= '0';
  wait for 10 ns;
  s_RegWrite <= '1';

  -- 2
  s_in <= "00010";
  wait for 10 ns;

  -- 3
  s_in <= "00011";
  wait for 10 ns;

  -- 4
  s_in <= "00100";
  wait for 10 ns;

  -- 5
  s_in <= "00101";
  wait for 10 ns;

  -- 6
  s_in <= "00110";
  wait for 10 ns;

  -- 7
  s_in <= "00111";
  s_RegWrite <= '0';
  wait for 10 ns;
  s_RegWrite <= '1';

  -- 8
  s_in <= "01000";
  wait for 10 ns;

  wait;
  end process;
  
end test;