library ieee;
use ieee.std_logic_1164.all;

--ALUControl Lines:
--  0000 - AND
--  0001 - OR
--  0010 - ADD
--  1010 - SUB
--  0011 - NOR
--  0100 - XOR
--  1101 - less than
-- 	0110 - shift left
--  0111 - shift right
--  1111 - shift right arithmetic

-- control [3] = nAdd_Sub,   FOR LATER: possibly use as select bit for Shifter
-- control [2:0] = operation

entity ALU_full is
	generic (N : integer := 32);
	port (  
		i_A, i_B : in std_logic_vector(N-1 downto 0); -- inputs
		ALUControl : in std_logic_vector(3 downto 0); -- controls AND/OR/ADD/SUB
		i_shamt	 :	in std_logic_vector(4 downto 0); -- shift ammount
		i_regShift: in std_logic;					 -- set for shift with reg
		o_out	 : out std_logic_vector(N-1 downto 0);	-- ALU output
		o_OvF 	 : out std_logic;						-- overflow
		o_zero	 : out std_logic); 						-- zero output
		
end ALU_full;


-- Architecture
architecture mixed of ALU_full is

-- components
component add_sub is
	generic (N : integer := 32);
	port (  i_X, i_Y : in std_logic_vector(N-1 downto 0);
			nAdd_Sub : in std_logic;							-- if set, i_X - i_Y
			o_S	 : out std_logic_vector(N-1 downto 0);
			o_C  : out std_logic;	 -- carry out
			o_OvF: out std_logic );  -- overflow
end component;

component mux8t1_N is
	generic (N : integer := 32);
	port (
			i_D0, i_D1, i_D2, i_D3, i_D4, i_D5, i_D6, i_D7 : in std_logic_vector(N-1 downto 0); -- inputs
			i_sel : in std_logic_vector(2 downto 0); -- 3 bit select line
			o_out : out std_logic_vector(N-1 downto 0)); -- output
end component;

component barrelShifter_32 is
	port (	i_shiftRight: in std_logic;
			i_shiftArithmetic: in std_logic; -- 00 for sll, 01 for srl, 11 for sra
			i_input		: in std_logic_vector(31 downto 0);
			i_shamt		: in std_logic_vector(4 downto 0);
			o_output	: out std_logic_vector(31 downto 0));
end component;

component mux2t1_N is
  generic(N : integer := 32); -- Generic of type integer for input/output data width. Default value is 32.
  port(i_S          : in std_logic;
       i_D0         : in std_logic_vector(N-1 downto 0);
       i_D1         : in std_logic_vector(N-1 downto 0);
       o_O          : out std_logic_vector(N-1 downto 0));

end component;


-- signals
signal s_add, s_or, s_and, s_nor, s_xor, s_less, s_shiftOut : std_logic_vector(N-1 downto 0); -- outputs of each component
signal s_carry, s_OvF, s_lessOneBit: std_logic;
signal s_shamt : std_logic_vector(4 downto 0);

begin

	-- logical signals
	s_and <= i_A AND i_B;
	s_or <= i_A OR i_B;
	s_nor <= NOT s_or;
	s_xor <= i_A XOR i_B;
	
	-- adder port map
	adder : add_sub port map (	i_X => i_A,
								i_Y => i_B,
								nAdd_Sub => ALUControl(3),
								o_S => s_add,
								o_OvF => s_OvF,
								o_C => s_carry);

	
	-- check if zero
	o_zero <= NOT (s_add(0) OR s_add(1) OR s_add(2) OR s_add(3) OR s_add(4) OR 
				s_add(5) OR s_add(6) OR s_add(7) OR s_add(8) OR s_add(9) OR 
				s_add(10) OR s_add(11) OR s_add(12) OR s_add(13) OR s_add(14) OR 
				s_add(15) OR s_add(16) OR s_add(17) OR s_add(18) OR s_add(19) OR 
				s_add(20) OR s_add(21) OR s_add(22) OR s_add(23) OR s_add(24) OR 
				s_add(25) OR s_add(26) OR s_add(27) OR s_add(28) OR s_add(29) OR 
				s_add(30) OR s_add(31));

	-- less than check
	with s_OvF select
	s_lessOneBit <= i_A(31) when '1',
			  s_add(31) when others;

	with s_lessOneBit select
	s_less <= x"00000001" when '1',
			  x"00000000" when others;

	-- shifter
	shiftRegMux : mux2t1_N
		generic map (N => 5)
		port map (	i_S => i_regShift,
					i_D0 => i_shamt,
					i_D1 => i_A(4 downto 0),
					o_O => s_shamt);


	shifter : barrelShifter_32					-- shift: R[rd] = R[rt] shifted by shamt
		port map (	i_shiftRight =>	ALUControl(0),
					i_shiftArithmetic => ALUControl(3),
					i_input => i_B,
					i_shamt => s_shamt,
					o_output => s_shiftOut);
	
	-- output mux
	mux : mux8t1_N port map (	i_D0 => s_and,
								i_D1 => s_or,
								i_D2 => s_add,
								i_D3 => s_nor,
								i_D4 => s_xor,
								i_D5 => s_less,
								i_D6 => s_shiftOut,	
								i_D7 => s_shiftOut,   
								i_sel => ALUControl(2 downto 0),
								o_out => o_out);

	o_OvF <= s_OvF; 

	
end mixed;


