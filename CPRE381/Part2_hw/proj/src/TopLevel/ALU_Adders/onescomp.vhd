library IEEE;
use IEEE.std_logic_1164.all;

--entity
entity onescomp is
	generic ( N: integer := 32);
	port ( i_in: in std_logic_vector(N-1 downto 0);
	       o_O: out std_logic_vector(N-1 downto 0));
end onescomp;

-- architecture
architecture structural of onescomp is

component invg is
  port(i_A          : in std_logic;
       o_F          : out std_logic);
end component;

-- loop all of N and inverte each bit
begin
for_loop: for i in 0 to N-1 generate
	
	o_O(i) <= NOT i_in(i);

end generate for_loop;

end structural;
