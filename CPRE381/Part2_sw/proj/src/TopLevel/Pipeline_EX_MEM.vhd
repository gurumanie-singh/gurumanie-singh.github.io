library ieee;
use ieee.std_logic_1164.all;

entity Pipeline_EX_MEM is
	
	port (
			-- clock and reset
			i_CLK	: in std_logic;
			i_RST	: in std_logic;

			-- inputs
			i_MemToReg 	: in std_logic_vector(1 downto 0);
			i_RegWrite	: in std_logic;
			i_RegDst	: in std_logic_vector(1 downto 0);
			i_luiSelect	: in std_logic_vector(1 downto 0);
			i_halt		: in std_logic;						-- halt signal
			i_signedLoad: in std_logic;
			i_DMemWr	: in std_logic;
			i_Rt_Rd_Addr: in std_logic_vector(4 downto 0);	-- Rd/Rt address. Selected from Mux. Is the write reg for that instruction. 
			i_ALUout	: in std_logic_vector(31 downto 0); -- ALU output value
			i_ForwardB	: in std_logic_vector(31 downto 0); -- output of ForwardB Mux. Used for Mem Data, should be extendedImm.
			i_luiValue	: in std_logic_vector(31 downto 0); -- Shifted Value for lui
			i_PCAdd4	: in std_logic_vector(31 downto 0); -- PC+4
			i_RtVal		: in std_logic_vector(31 downto 0); -- value of Rt

			-- outputs
			o_MemToReg 	: out std_logic_vector(1 downto 0);
			o_RegWrite	: out std_logic;
			o_RegDst	: out std_logic_vector(1 downto 0);
			o_luiSelect	: out std_logic_vector(1 downto 0);
			o_halt		: out std_logic;						-- halt signal
			o_signedLoad: out std_logic;
			o_DMemWr	: out std_logic;
			o_Rt_Rd_Addr: out std_logic_vector(4 downto 0);	-- Rd/Rt address. Selected from Mux. Is the write reg for that instruction. 
			o_ALUout	: out std_logic_vector(31 downto 0); -- ALU output value
			o_ForwardB	: out std_logic_vector(31 downto 0);  -- output of ForwardB Mux. Used for Mem Data, should be extendedImm.
			o_luiValue	: out std_logic_vector(31 downto 0); -- Shifted Value for lui
			o_PCAdd4	: out std_logic_vector(31 downto 0); -- PC+4
			o_RtVal		: out std_logic_vector(31 downto 0) -- value of Rt
	);
end Pipeline_EX_MEM;


architecture structural of Pipeline_EX_MEM is

component dffg is
  port(i_CLK        : in std_logic;     -- Clock input
       i_RST        : in std_logic;     -- Reset input
       i_WE         : in std_logic;     -- Write enable input
       i_D          : in std_logic;     -- Data value input
       o_Q          : out std_logic);   -- Data value output
end component;

component reg_N is
	generic( N : integer := 32);
	port (
		i_data   : in std_logic_vector(N-1 downto 0);
		i_writeEn: in std_logic;
		i_reset  : in std_logic;
		i_clock  : in std_logic;
		o_output : out std_logic_vector(N-1 downto 0));
end component;

begin

memToReg : reg_N
	generic map (N => 2)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_MemToReg,
				o_output => o_MemToReg);

regWr : dffg
	port map (	i_CLK => i_CLK,
				i_RST => i_RST,
				i_WE => '1',
				i_D => i_RegWrite,
				o_Q => o_RegWrite);

regDst : reg_N
	generic map (N => 2)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_RegDst,
				o_output => o_RegDst);

lui : reg_N
	generic map (N => 2)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_luiSelect,
				o_output => o_luiSelect);

halt : dffg
	port map (	i_CLK => i_CLK,
				i_RST => i_RST,
				i_WE => '1',
				i_D => i_halt,
				o_Q => o_halt);

signedLoad : dffg
	port map (	i_CLK => i_CLK,
				i_RST => i_RST,
				i_WE => '1',
				i_D => i_signedLoad,
				o_Q => o_signedLoad);

DmemWr : dffg
	port map (	i_CLK => i_CLK,
				i_RST => i_RST,
				i_WE => '1',
				i_D => i_DMemWr,
				o_Q => o_DMemWr);

Rt_Rd_Addr : reg_N
	generic map (N => 5)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_Rt_Rd_Addr,
				o_output => o_Rt_Rd_Addr);

ALUout : reg_N
	generic map (N => 32)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_ALUout,
				o_output => o_ALUout);

ForwardB : reg_N
	generic map (N => 32)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_ForwardB,
				o_output => o_ForwardB);

luiValue : reg_N
	generic map (N => 32)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_luiValue,
				o_output => o_luiValue);

PCAdd4 : reg_N
	generic map (N => 32)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_PCAdd4,
				o_output => o_PCAdd4);

RtVal : reg_N
	generic map (N => 32)
	port map (	i_clock => i_CLK,
				i_reset => i_RST,
				i_writeEn => '1',
				i_data => i_RtVal,
				o_output => o_RtVal);

end structural;