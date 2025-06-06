library ieee;
use ieee.std_logic_1164.all;

entity tb_dmem is
		generic (
			DATA_WIDTH : natural := 32;
			ADDR_WIDTH : natural := 10;
			CLK_HALFPER : time := 5 ns);
end tb_dmem;

architecture test of tb_dmem is
	
component mem is
	generic (
		DATA_WIDTH : natural := 32;
		ADDR_WIDTH : natural := 10);
	port (	
		clk		: in std_logic;
		addr	        : in std_logic_vector((ADDR_WIDTH-1) downto 0);
		data	        : in std_logic_vector((DATA_WIDTH-1) downto 0);
		we		: in std_logic := '1';
		q		: out std_logic_vector((DATA_WIDTH -1) downto 0));
end component;


-- signals
signal s_we, s_clk : std_logic;
signal s_q, s_data : std_logic_vector((DATA_WIDTH -1) downto 0);
signal s_addr 	: std_logic_vector((ADDR_WIDTH-1) downto 0);
signal s_1, s_2, s_3, s_4, s_5, s_6, s_7, s_8, s_9, s_0 : std_logic_vector((DATA_WIDTH -1) downto 0); -- used to set the values inside the mem

-- port map
begin

dmem : mem port map (	clk => s_clk,
						addr => s_addr,
						data => s_data,
						we => s_we,
						q => s_q); 


-- Clock
clock : process begin
    s_clk <= '0';
    wait for CLK_HALFPER;
    s_clk <= '1';
    wait for CLK_HALFPER;
end process;

-- test
test: process begin


	s_we <= '0'; -- write disable
	s_data <= x"00000000";	-- doesnt matter

	s_addr <= "0000000000"; -- read addr 0x000
	wait for (CLK_HALFPER);	-- wait for clock change
	s_0 <= s_q; -- sets signals to the values read

	s_addr <= "0000000001"; 
	wait for (CLK_HALFPER);  
	s_1 <= s_q; 
	
	s_addr <= "0000000010"; 
	wait for (CLK_HALFPER);  
	s_2 <= s_q; 
	
	s_addr <= "0000000011"; 
	wait for (CLK_HALFPER);  
	s_3 <= s_q; 
	
	s_addr <= "0000000100"; 
	wait for (CLK_HALFPER);  
	s_4 <= s_q; 
	
	s_addr <= "0000000101"; 
	wait for (CLK_HALFPER);  
	s_5 <= s_q; 
	
	s_addr <= "0000000110"; 
	wait for (CLK_HALFPER);  
	s_6 <= s_q; 
	
	s_addr <= "0000000111"; 
	wait for (CLK_HALFPER);  
	s_7 <= s_q; 
	
	s_addr <= "0000001000"; 
	wait for (CLK_HALFPER);  
	s_8 <= s_q; 
	
	s_addr <= "0000001001"; 
	wait for (CLK_HALFPER);  
	s_9 <= s_q;

	-- now write these values starting at addr 0x100

	s_we <= '1'; -- write enable

	s_addr <= "0100000000"; -- set addr
	s_data <= s_0;	-- data is from signal before
	wait for (2 * CLK_HALFPER); -- wait for a clock cycle to set values

	s_addr <= "0100000001"; 
	s_data <= s_1; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100000010"; 
	s_data <= s_2; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100000011"; 
	s_data <= s_3; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100000100"; 
	s_data <= s_4; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100000101"; 
	s_data <= s_5; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100000110"; 
	s_data <= s_6; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100000111"; 
	s_data <= s_7; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100001000"; 
	s_data <= s_8; 
	wait for (2 * CLK_HALFPER);
	
	s_addr <= "0100001001"; 
	s_data <= s_9; 
	wait for (2 * CLK_HALFPER);

	-- now reread those new values
	
	s_we <= '0'; -- write disable
	s_data <= x"00000000";	-- doesnt matter

	s_addr <= "0100000000"; -- read addr 0x000
	wait for (CLK_HALFPER);	-- wait for clock change
	s_0 <= s_q; -- sets signals to the values read

	s_addr <= "0100000001"; 
	wait for (CLK_HALFPER);  
	s_1 <= s_q; 
	
	s_addr <= "0100000010"; 
	wait for (CLK_HALFPER);  
	s_2 <= s_q; 
	
	s_addr <= "0100000011"; 
	wait for (CLK_HALFPER);  
	s_3 <= s_q; 
	
	s_addr <= "0100000100"; 
	wait for (CLK_HALFPER);  
	s_4 <= s_q; 
	
	s_addr <= "0100000101"; 
	wait for (CLK_HALFPER);  
	s_5 <= s_q; 
	
	s_addr <= "0100000110"; 
	wait for (CLK_HALFPER);  
	s_6 <= s_q; 
	
	s_addr <= "0100000111"; 
	wait for (CLK_HALFPER);  
	s_7 <= s_q; 
	
	s_addr <= "0100001000"; 
	wait for (CLK_HALFPER);  
	s_8 <= s_q; 
	
	s_addr <= "0100001001"; 
	wait for (CLK_HALFPER);  
	s_9 <= s_q;


wait;
end process;

end test;