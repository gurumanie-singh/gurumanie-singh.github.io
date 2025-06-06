library ieee;
use ieee.std_logic_1164.all;

entity tb_add_sub is
	generic ( wait_time : time := 10 ns;
		  N : integer := 32);
end tb_add_sub;

-- architecture
architecture testbench of tb_add_sub is

component add_sub is
	generic (N : integer := 32);
	port (  i_X, i_Y : in std_logic_vector(N-1 downto 0);
		nAdd_Sub : in std_logic;
		o_S	 : out std_logic_vector(N-1 downto 0);
		o_C	 : out std_logic );
end component;


-- define signals
signal s_X, s_Y, s_Sum : std_logic_vector(N-1 downto 0);
signal s_sub, s_Cout : std_logic;

-- map signals to ports
begin
my_adder : add_sub
port map ( i_X => s_X,
	   i_Y => s_Y,
	   nAdd_Sub => s_sub,
	   o_S => s_Sum,
	   o_C => s_Cout );


-- begin tests
test: process begin
	
	-- test 1
	s_X <= x"00000000";
	s_Y <= x"00000001";
	s_sub <= '0';
	wait for wait_time;
	-- Expected: s_Sum = 0x0000_0001
	--	     s_C  = 0

	-- test 2
	s_X <= x"00000000";  
	s_Y <= x"00000001";  
	s_sub <= '1';
	wait for wait_time;
	-- Expected: s_Sum = -1
	--	     s_C  = 0

	-- test 3
	s_X <= x"FFFFFFFF";  -- 
	s_Y <= x"00000001";  -- 
	s_sub <= '0';
	wait for wait_time;
	-- Expected: s_Sum = 0x00000000
	--	     s_C  = 1

	-- test 4
	s_X <= x"FFFFFFFF";  -- -1
	s_Y <= x"00000001";  -- 1
	s_sub <= '1';
	wait for wait_time;
	-- Expected: s_Sum = 0xFFFFFFFE
	--	     s_C  = 1

	-- test 5
	s_X <= x"FFFFFFFF";  
	s_Y <= x"00000000"; 
	s_sub <= '0';
	wait for wait_time;
	-- Expected: s_Sum = 0xFFFFFFFF
	--	     s_C  = 0

	-- test 6
	s_X <= x"FFFFFFFF";  
	s_Y <= x"00000000"; 
	s_sub <= '1';
	wait for wait_time;
	-- Expected: s_Sum = 0xFFFFFFFF
	--	     s_C  = 1

	-- test 7
	s_X <= x"00000014";  -- 20
	s_Y <= x"00000005"; -- 5
	s_sub <= '0';
	wait for wait_time;
	-- Expected: s_Sum = 0x00000019
	--	     s_C  = 0

	-- test 8
	s_X <= x"00000014";  -- 20
	s_Y <= x"00000005"; -- 5
	s_sub <= '1';
	wait for wait_time;
	-- Expected: s_Sum = 0x0000000F
	--	     s_C  = 1

wait;
end process;

end testbench;