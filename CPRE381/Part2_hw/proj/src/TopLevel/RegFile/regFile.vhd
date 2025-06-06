library ieee;
use ieee.std_logic_1164.all;

entity regFile is
	port (	
		i_rt 		: in std_logic_vector(4 downto 0);  	-- read reg 0 select
		i_rs 		: in std_logic_vector(4 downto 0);  	-- read reg 1 select
		i_rd		: in std_logic_vector(4 downto 0);  	-- write reg select  (set to 0 for no writing)
		i_RegWrite	: in std_logic;			    	-- if 1, you can write, 0 means you cannot write
		i_data		: in std_logic_vector(31 downto 0); 	-- write data
		i_clk, i_rst	: in std_logic;	 	  	    	-- clock and reset
		o_rt 		: out std_logic_vector(31 downto 0); 	-- output of reg 0
		o_rs 		: out std_logic_vector(31 downto 0)); 	-- output of reg 1
end regFile;


-------------  architecture --------------
architecture structural of regFile is

----------  components --------------
component reg_N_bypass is
	generic( N : integer := 32);
	port (
		i_data   : in std_logic_vector(N-1 downto 0);
		i_writeEn: in std_logic;
		i_reset  : in std_logic;
		i_clock  : in std_logic;
		o_output : out std_logic_vector(N-1 downto 0));
end component;

component reg29_N is
	generic( N : integer := 32);
	port (
		i_data   : in std_logic_vector(N-1 downto 0);
		i_writeEn: in std_logic;
		i_reset  : in std_logic;
		i_clock  : in std_logic;
		o_output : out std_logic_vector(N-1 downto 0));
end component;

component decoder_5t32 is
	port ( i_in  : in std_logic_vector(4 downto 0); -- 5 bit input select
	       i_en : in std_logic;
	       o_out : out std_logic_vector(31 downto 0)); -- 2^5 output
end component;


component mux_32t1_n is
	generic (N : integer:= 32);
	port ( 
		i_D0, i_D1, i_D2, i_D3, i_D4, i_D5, i_D6,
		i_D7, i_D8, i_D9, i_D10, i_D11, i_D12, i_D13, i_D14, i_D15,
		i_D16, i_D17, i_D18, i_D19, i_D20, i_D21, i_D22, i_D23,
		i_D24, i_D25, i_D26, i_D27, i_D28, i_D29, i_D30, i_D31	: in std_logic_vector(N-1 downto 0);
		i_S : in std_logic_vector(4 downto 0);
		o_out : out std_logic_vector(N-1 downto 0));
end component;

---------------  signals -----------------
signal	s_D0, s_D1, s_D2, s_D3, s_D4, s_D5, s_D6, s_D7, s_D8, s_D9, s_D10, s_D11, 
	s_D12, s_D13, s_D14, s_D15, s_D16, s_D17, s_D18, s_D19, s_D20, s_D21, s_D22, 
	s_D23, s_D24, s_D25, s_D26, s_D27, s_D28, s_D29, s_D30, s_D31 : std_logic_vector(31 downto 0); -- signals for outputs of each reg

signal s_decode : std_logic_vector(31 downto 0); -- signal for output of decoder

--------- mapping ---------------
begin

-- decoder
my_decoder: decoder_5t32 port map ( i_in => i_rd,
				    i_en => i_RegWrite,
				    o_out => s_decode);

-- registers
reg0 : reg_N_bypass port map (	i_data => x"00000000",
			i_writeEn => '0',
			i_reset => '1',
			i_clock => i_clk,
			o_output => s_D0);  -- reg 0 is set as constant 0. 

reg1 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(1),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D1);

reg2 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(2),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D2);

reg3 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(3),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D3);

reg4 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(4),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D4);

reg5 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(5),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D5);

reg6 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(6),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D6);

reg7 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(7),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D7);

reg8 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(8),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D8);

reg9 : reg_N_bypass port map (	i_data => i_data,
			i_writeEn => s_decode(9),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D9);

reg10 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(10),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D10);

reg11 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(11),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D11);

reg12 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(12),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D12);

reg13 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(13),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D13);

reg14 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(14),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D14);

reg15 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(15),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D15);

reg16 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(16),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D16);

reg17 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(17),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D17);

reg18 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(18),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D18);

reg19 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(19),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D19);

reg20 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(20),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D20);

reg21 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(21),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D21);

reg22 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(22),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D22);

reg23 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(23),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D23);

reg24 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(24),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D24);

reg25 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(25),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D25);

reg26 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(26),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D26);

reg27 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(27),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D27);

reg28 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(28),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D28);

-- on RST: 0x7FFF_EFFC
reg29 : reg29_N port map (i_data => i_data,
			i_writeEn => s_decode(29),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D29);

reg30 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(30),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D30);

reg31 : reg_N_bypass port map (i_data => i_data,
			i_writeEn => s_decode(31),
			i_reset => i_rst,
			i_clock => i_clk,
			o_output => s_D31);

-- read muxes
rs_mux: mux_32t1_N 
port map ( i_D0 => s_D0,
           i_D1 => s_D1,
           i_D2 => s_D2,
           i_D3 => s_D3,
           i_D4 => s_D4,
           i_D5 => s_D5,
           i_D6 => s_D6,
           i_D7 => s_D7,
           i_D8 => s_D8,
           i_D9 => s_D9,
           i_D10 => s_D10,
           i_D11 => s_D11,
           i_D12 => s_D12,
           i_D13 => s_D13,
           i_D14 => s_D14,
           i_D15 => s_D15,
           i_D16 => s_D16,
           i_D17 => s_D17,
           i_D18 => s_D18,
           i_D19 => s_D19,
           i_D20 => s_D20,
           i_D21 => s_D21,
           i_D22 => s_D22,
           i_D23 => s_D23,
           i_D24 => s_D24,
           i_D25 => s_D25,
           i_D26 => s_D26,
           i_D27 => s_D27,
           i_D28 => s_D28,
           i_D29 => s_D29,
           i_D30 => s_D30,
           i_D31 => s_D31,
	   i_S => i_rs,
	   o_out => o_rs);

rt_mux: mux_32t1_N 
port map ( i_D0 => s_D0,
           i_D1 => s_D1,
           i_D2 => s_D2,
           i_D3 => s_D3,
           i_D4 => s_D4,
           i_D5 => s_D5,
           i_D6 => s_D6,
           i_D7 => s_D7,
           i_D8 => s_D8,
           i_D9 => s_D9,
           i_D10 => s_D10,
           i_D11 => s_D11,
           i_D12 => s_D12,
           i_D13 => s_D13,
           i_D14 => s_D14,
           i_D15 => s_D15,
           i_D16 => s_D16,
           i_D17 => s_D17,
           i_D18 => s_D18,
           i_D19 => s_D19,
           i_D20 => s_D20,
           i_D21 => s_D21,
           i_D22 => s_D22,
           i_D23 => s_D23,
           i_D24 => s_D24,
           i_D25 => s_D25,
           i_D26 => s_D26,
           i_D27 => s_D27,
           i_D28 => s_D28,
           i_D29 => s_D29,
           i_D30 => s_D30,
           i_D31 => s_D31,
	   i_S => i_rt,
	   o_out => o_rt);

end structural; 

		