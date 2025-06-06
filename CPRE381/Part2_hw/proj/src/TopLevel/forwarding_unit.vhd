library ieee;
use ieee.std_logic_1164.all;

entity forwarding_unit is
	port (	i_RegDst_MEM	: in std_logic_vector(1 downto 0); -- to check if inst is jal: regDst(1) = 1
			i_RegDst_WB		: in std_logic_vector(1 downto 0); -- to check if inst is jal: regDst(1) = 1
			i_RegWrite_EX	: in std_logic;
			i_RegWrite_MEM 	: in std_logic;
			i_RegWrite_WB 	: in std_logic;
			i_Rt_Rd_EX		: in std_logic_vector(4 downto 0);
			i_Rt_Rd_MEM 	: in std_logic_vector(4 downto 0);
			i_Rt_Rd_WB		: in std_logic_vector(4 downto 0);
			i_RtAddr_EX		: in std_logic_vector(4 downto 0);
			i_RsAddr_EX		: in std_logic_vector(4 downto 0);
			i_ALUSrc_EX		: in std_logic;
			i_branch		: in std_logic;
			i_jrSelect		: in std_logic;
			i_RtAddr_ID		: in std_logic_vector(4 downto 0);
			i_RsAddr_ID		: in std_logic_vector(4 downto 0);
			i_luiSelect_MEM	: in std_logic_vector(1 downto 0);
			i_MemRead_MEM	: in std_logic;
			o_ForwardDMem	: out std_logic_vector(1 downto 0);
			o_ForwardRtEx 	: out std_logic_vector(1 downto 0);
			o_ForwardA		: out std_logic_vector(1 downto 0);
			o_ForwardB		: out std_logic_vector(1 downto 0);
			o_ForwardRt		: out std_logic_vector(1 downto 0);
			o_ForwardRs		: out std_logic_vector(1 downto 0);
			o_StallIF		: out std_logic;
			o_StallID		: out std_logic;
			o_FlushID		: out std_logic;
			o_FlushEX		: out std_logic); 

end forwarding_unit;


architecture dataflow of forwarding_unit is

-----Consuming points:
--ForwardA : ALU input A
--ForwardB : ALU input B
--DMemIn
--RsVal_ID : branch or jr
--RtVal_ID : branch or jr
--RtVal_EX : sw DMem input

signal s_branchOrjr : std_logic;

signal s_StallID	: std_logic;
signal s_StallEX_Rt	: std_logic;
signal s_StallEX_Rs	: std_logic;

begin

s_branchOrjr <= i_branch OR i_jrSelect;

o_ForwardA <= 	"11" when ((i_Rt_Rd_MEM /= "00000") AND (i_Rt_Rd_MEM = i_RsAddr_EX) AND i_luiSelect_MEM = "01") else	-- P4: luiValue in MEM to ALUInA in EX
				"10" when (i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND (i_Rt_Rd_MEM = i_RsAddr_EX)) else 		-- P1: ALUOut_MEM to ALUInA in EX
				"01" when (i_RegWrite_WB = '1' AND (i_Rt_Rd_WB /= "00000") AND (i_Rt_Rd_WB = i_RsAddr_EX)) else 		-- P2: RegWrData in WB to ALUInA in EX
				"01" when (i_RegWrite_WB = '1' AND (i_RegDst_WB(1) = '1') AND (i_RsAddr_EX = "11111")) else				-- jal
				"00";

-- C1/C2: make sure its also not using the immediate value (ALUSrc = 0).
o_ForwardB <= 	"11" when ((i_Rt_Rd_MEM /= "00000") AND (i_Rt_Rd_MEM = i_RtAddr_EX) AND i_luiSelect_MEM = "01" AND i_ALUSrc_EX = '0') else  -- P4: luiValue in MEM to ALUInB in EX
				"10" when (i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND (i_Rt_Rd_MEM = i_RtAddr_EX) AND i_ALUSrc_EX = '0') else 	-- P1: ALUOut in MEM to ALUInB in EX
				"01" when (i_RegWrite_WB = '1' AND (i_Rt_Rd_WB /= "00000") AND (i_Rt_Rd_WB = i_RtAddr_EX) AND i_ALUSrc_EX = '0') else		-- P2: RegWrData in WB to ALUInB in EX
				"01" when (i_RegWrite_WB = '1' AND (i_RegDst_WB(1) = '1') AND (i_RtAddr_EX = "11111") AND i_ALUSrc_EX = '0') else			-- jal
				"00";

-- C4/C5: only occurs for jr or beq. Make sure that if stalling occurs, do the stall first
o_ForwardRs <= 	"11" when (i_luiSelect_MEM = "01" AND (i_Rt_Rd_MEM /= "00000") AND (s_branchOrjr = '1') AND (i_Rt_Rd_MEM = i_RsAddr_ID)) else  	-- P4: luiValue in MEM to Rs in ID
				"10" when (i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND (s_branchOrjr = '1') AND (i_Rt_Rd_MEM = i_RsAddr_ID)) else		-- P1: ALUOut in MEM to Rs value in ID
				"01" when (i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND (s_branchOrjr = '1') AND (i_RsAddr_ID = "11111") AND (i_RegDst_WB(1) = '1')) else -- P3: PC+4 in MEM to Rs in ID
				"00";

o_ForwardRt <= 	"11" when (i_luiSelect_MEM = "01" AND (i_Rt_Rd_MEM /= "00000") AND (s_branchOrjr = '1') AND (i_Rt_Rd_MEM = i_RtAddr_ID)) else  	-- P4: luiValue in MEM to Rt in ID
				"10" when (i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND (s_branchOrjr = '1') AND (i_Rt_Rd_MEM = i_RtAddr_ID)) else		-- P1: ALUOut in MEM to Rt value in ID
				"01" when (i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND (s_branchOrjr = '1') AND (i_RtAddr_ID = "11111") AND (i_RegDst_MEM(1) = '1')) else -- P3: PC+4 in MEM to Rs in ID
				"00";

-- Load use hazard. Stall EX.
s_StallEX_Rs <= '1' when (i_MemRead_MEM = '1' AND i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND i_Rt_Rd_MEM = i_RsAddr_EX) else
				'0';

s_StallEX_Rt <= '1' when (i_MemRead_MEM = '1' AND i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND i_Rt_Rd_MEM = i_RtAddr_EX AND i_ALUSrc_EX = '0') else
				'0';

-- Stalling ID only occurs for branch/jr when DataWrite in EX or load in MEM
s_StallID <= 	'1' when (i_RegWrite_EX = '1' AND (i_Rt_Rd_EX /= "00000") AND (s_branchOrjr = '1') AND (i_Rt_Rd_EX = i_RtAddr_ID OR i_Rt_Rd_EX = i_RsAddr_ID)) else
				'1' when (i_MemRead_MEM = '1' AND i_RegWrite_MEM = '1' AND (i_Rt_Rd_MEM /= "00000") AND (s_branchOrjr = '1') AND (i_Rt_Rd_MEM = i_RtAddr_ID OR i_Rt_Rd_MEM = i_RsAddr_ID)) else
				'0';


-- C3: Hazards for sw DMem data
o_ForwardDMem <= "01" when (i_RegWrite_WB = '1' AND (i_Rt_Rd_WB /= "00000") AND (i_Rt_Rd_WB = i_Rt_Rd_MEM)) else -- RegWrData in WB to DMemData in MEM. Rt_Rd_MEM will be RtAddr for sw in MEM.
				 "00";

o_ForwardRtEx <= "01" when (i_RegWrite_WB = '1' AND (i_Rt_Rd_WB /= "00000") AND (i_Rt_Rd_WB = i_RtAddr_EX)) else	 -- RegWrData in WB to RtVal in EX. Used only for sw.
				 "01" when (i_RegWrite_WB = '1' AND (i_RegDst_WB(1) = '1') AND (i_RtAddr_EX = "11111")) else
				 "00";



-- Stalling / Flushing cases for each pipeline
o_StallIF <= 	'1' when (s_StallEX_Rt = '1' OR s_StallEX_Rs = '1' OR s_StallID = '1') else
				'0';

o_StallID <=	'1' when (s_StallEX_Rt = '1' OR s_StallEX_Rs = '1') else
				'0';

o_FlushID <=	'1' when ((s_StallID = '1') AND (s_StallEX_Rt = '0') AND (s_StallEX_Rs = '0')) else
				'0';

o_FlushEX <=	'1' when (s_StallEX_Rt = '1' OR s_StallEX_Rs = '1') else
				'0';



end dataflow;