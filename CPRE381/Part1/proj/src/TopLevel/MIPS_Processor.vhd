-------------------------------------------------------------------------
-- Henry Duwe
-- Department of Electrical and Computer Engineering
-- Iowa State University
-------------------------------------------------------------------------


-- MIPS_Processor.vhd
-------------------------------------------------------------------------
-- DESCRIPTION: This file contains a skeleton of a MIPS_Processor  
-- implementation.

-- 01/29/2019 by H3::Design created.
-------------------------------------------------------------------------


library IEEE;
use IEEE.std_logic_1164.all;

library work;
use work.MIPS_types.all;

entity MIPS_Processor is
  generic(N : integer := DATA_WIDTH);
  port(iCLK            : in std_logic;
       iRST            : in std_logic;
       iInstLd         : in std_logic;
       iInstAddr       : in std_logic_vector(N-1 downto 0);
       iInstExt        : in std_logic_vector(N-1 downto 0);
       oALUOut         : out std_logic_vector(N-1 downto 0)); -- TODO: Hook this up to the output of the ALU. It is important for synthesis that you have this output that can effectively be impacted by all other components so they are not optimized away.

end  MIPS_Processor;


architecture structure of MIPS_Processor is

  -- Required data memory signals
  signal s_DMemWr       : std_logic; -- TODO: use this signal as the final active high data memory write enable signal
  signal s_DMemAddr     : std_logic_vector(N-1 downto 0); -- TODO: use this signal as the final data memory address input
  signal s_DMemData     : std_logic_vector(N-1 downto 0); -- TODO: use this signal as the final data memory data input
  signal s_DMemOut      : std_logic_vector(N-1 downto 0); -- TODO: use this signal as the data memory output
 
  -- Required register file signals 
  signal s_RegWr        : std_logic; -- TODO: use this signal as the final active high write enable input to the register file
  signal s_RegWrAddr    : std_logic_vector(4 downto 0); -- TODO: use this signal as the final destination register address input
  signal s_RegWrData    : std_logic_vector(N-1 downto 0); -- TODO: use this signal as the final data memory data input

  -- Required instruction memory signals
  signal s_IMemAddr     : std_logic_vector(N-1 downto 0); -- Do not assign this signal, assign to s_NextInstAddr instead
  signal s_NextInstAddr : std_logic_vector(N-1 downto 0); -- TODO: use this signal as your intended final instruction memory address input.
  signal s_Inst         : std_logic_vector(N-1 downto 0); -- TODO: use this signal as the instruction signal 

  -- Required halt signal -- for simulation
  signal s_Halt         : std_logic;  -- TODO: this signal indicates to the simulation that intended program execution has completed. (Opcode: 01 0100)

  -- Required overflow signal -- for overflow exception detection
  signal s_Ovfl         : std_logic;  -- TODO: this signal indicates an overflow exception would have been initiated

	-- memory
  component mem is
    generic(ADDR_WIDTH : integer;
            DATA_WIDTH : integer);
    port(
          clk          : in std_logic;
          addr         : in std_logic_vector((ADDR_WIDTH-1) downto 0);
          data         : in std_logic_vector((DATA_WIDTH-1) downto 0);
          we           : in std_logic := '1';
          q            : out std_logic_vector((DATA_WIDTH -1) downto 0));
    end component;

	signal s_memToReg : std_logic_vector(1 downto 0); -- signal that controls if the write data should come from ALU or Mem
	signal s_memToRegValue : std_logic_vector((DATA_WIDTH - 1) downto 0); -- output of memToRegMux
	signal s_loadByte : std_logic_vector(7 downto 0); 	-- byte selection from load
	signal s_byteExtend : std_logic_vector(31 downto 0); -- extended byte selection
	signal s_loadHalf : std_logic_vector(15 downto 0);	-- halfword selection from load
	signal s_halfExtend : std_logic_vector(31 downto 0); -- extended halfword selection

	-- PC reg
	component PC_reg is
		generic( N : integer := 32);
		port (
			i_data   : in std_logic_vector(N-1 downto 0);
			i_writeEn: in std_logic;
			i_reset  : in std_logic;
			i_clock  : in std_logic;
			o_output : out std_logic_vector(N-1 downto 0));
	end component;

	-- RegFile component
	component regFile is
		port (	
			i_rt 		: in std_logic_vector(4 downto 0);  -- read reg 0 select
			i_rs 		: in std_logic_vector(4 downto 0);  -- read reg 1 select
			i_rd		: in std_logic_vector(4 downto 0);  -- write reg select  (set to 0 for no writing)
			i_RegWrite 	: in std_logic;				-- write enable
			i_data		: in std_logic_vector(31 downto 0); -- write data
			i_clk, i_rst	: in std_logic;	 	  -- clock and reset
			o_rt 		: out std_logic_vector(31 downto 0); -- output of reg 0
			o_rs 		: out std_logic_vector(31 downto 0)); -- output of reg 1
	end component;

	signal s_regRT : std_logic_vector((DATA_WIDTH - 1) downto 0); -- reg output rt
	signal s_regRS : std_logic_vector((DATA_WIDTH - 1) downto 0); -- reg output rs
	signal s_regDst : std_logic_vector(1 downto 0); 	-- controlled by Control Unit, set for R-Type intruction

	-- ALU component
	component ALU_full is
		generic (N : integer := 32);
		port (  
			i_A, i_B : in std_logic_vector(N-1 downto 0); -- inputs
			ALUControl : in std_logic_vector(3 downto 0); -- controls AND/OR/ADD/SUB
			i_shamt	 : in std_logic_vector(4 downto 0);		-- shift ammount
			i_regShift: in std_logic;
			o_out	 : out std_logic_vector(N-1 downto 0);	-- ALU output
			o_OvF 	 : out std_logic;						-- overflow
			o_zero	 : out std_logic); 						-- zero output		
	end component;

	signal s_ALUout		: std_logic_vector((DATA_WIDTH -1) downto 0); -- output of ALU
	signal s_ALUzero 	: std_logic;								  -- zero output of ALU
	signal s_ALUControl 	: std_logic_vector(3 downto 0);				 -- Selects which function to preform within the ALU.
	signal s_ALUSrc 	: std_logic; 					  			-- When set, selects a mux to send immediate value to ALU.
	signal s_ALUinB 	: std_logic_vector((DATA_WIDTH -1) downto 0); -- output of ScrMUX. Input B to ALU.
	signal s_AdderOvFl	: std_logic;
	signal s_notZero	: std_logic;

	-- N-bit 2t1 Mux component
	component mux2t1_N is
	  generic(N : integer := 32); -- Generic of type integer for input/output data width. Default value is 32.
	  port(i_S          : in std_logic;
	       i_D0         : in std_logic_vector(N-1 downto 0);
	       i_D1         : in std_logic_vector(N-1 downto 0);
	       o_O          : out std_logic_vector(N-1 downto 0));
	end component;

	-- one bit 2t1 mux
	component mux2t1_dataflow is
		port(   i_D0 : in std_logic;
				i_D1 : in std_logic;
				i_S : in std_logic;
				o_O : out std_logic);
	end component;

	-- 4t1 mux
	component mux4t1_N is
		generic (N : integer := 32);
		port (	
				i_D0, i_D1, i_D2, i_D3 : in std_logic_vector(N-1 downto 0); -- inputs
				i_S : in std_logic_vector(1 downto 0); -- select line
				o_O : out std_logic_vector(N-1 downto 0)); -- output
	end component;

	-- sign/zero extenders
	component extender_16to32 is
		port (	i_signSelect : in std_logic;
				i_imm : in std_logic_vector(15 downto 0);
				o_out : out std_logic_vector(31 downto 0));
	end component;

	signal s_extendSelect : std_logic; 					 -- if set, selects signExtention, else zeroExtention
	signal s_extendedImm : std_logic_vector(31 downto 0); -- the extended immediate

	component extender8t32 is
		port (	i_signSelect : in std_logic;
				i_imm 		: in std_logic_vector(7 downto 0);
				o_out 		: out std_logic_vector(31 downto 0));
	end component;

----------------------- CONTROL UNIT ----------------------
	component ControlUnit is
		port (	
			i_opcode 	: in std_logic_vector(5 downto 0);
			o_RegDst 	: out std_logic_vector(1 downto 0);
			o_Jump		: out std_logic;
			o_Branch 	: out std_logic;
			-- o_MemRead 	: out std_logic;
			o_MemToReg 	: out std_logic_vector(1 downto 0);
			o_ALUOp 	: out std_logic_vector(2 downto 0);
			o_MemWrite 	: out std_logic;
			o_ALUSrc 	: out std_logic;
			o_RegWrite 	: out std_logic;
			o_SignExt	: out std_logic;
			o_Halt		: out std_logic;
			o_luiSelect 	: out std_logic_vector(1 downto 0);
			o_checkOvFl 	: out std_logic;
			o_SignedLoad 	: out std_logic;
			o_equalSelect	: out std_logic); 	
	end component;

	-- Control Unit signals
	signal s_jumpSelect : std_logic;				-- set for jump instructions
	signal s_branchSelect : std_logic;				-- set for branch instructions
	signal s_ALUOp : std_logic_vector(2 downto 0);   -- input to ALU controller. Selects the opperation or tells controller to look at funct field.
	signal s_luiSelect : std_logic_vector(1 downto 0); -- set for lui only. 
	signal s_luiLoad : std_logic_vector(31 downto 0); -- value for regWriteData if inst is lui
	signal s_checkAddiOvF : std_logic; -- set to check overFlow for Addi. 
	signal s_signedLoad : std_logic; -- set for signed extended loads; lb, lh. Clear for lbu, lhu.
	signal s_equalSelect: std_logic; -- set for beq. Checks for zero, otherwise checks for NOT zero.


	-- ALU Controller
	component ALUController is
		port (	
			i_Function 	: in std_logic_vector(5 downto 0);
			i_ALUOp 	: in std_logic_vector(2 downto 0);
			o_ALUControl	: out std_logic_vector(3 downto 0);
			o_checkOvFl 	: out std_logic;
			o_jrSelect		: out std_logic;
			o_regShift		: out std_logic);			-- use funct to select if arithmetic shift or not	
	end component;

	signal s_checkAddSubOvF : std_logic;
	signal s_jrSelect		: std_logic;
	signal s_jumpMuxOut		: std_logic_vector(31 downto 0);
	signal s_regShift: std_logic;

	-- PC
	component reg_N is
		generic( N : integer := 32);
		port (
			i_data   : in std_logic_vector(N-1 downto 0);
			i_writeEn: in std_logic;
			i_reset  : in std_logic;
			i_clock  : in std_logic;
			o_output : out std_logic_vector(N-1 downto 0));
	end component;

	signal s_PCin : std_logic_vector(31 downto 0);
	signal s_newPC : std_logic_vector(31 downto 0); -- PC+4


	-- adder
	component ripple_carry_adder is
		generic (N : integer := 32);
		port (  i_X, i_Y : in std_logic_vector(N-1 downto 0);
			i_C	 : in std_logic;
			o_S	 : out std_logic_vector(N-1 downto 0);
			o_C	 : out std_logic );
	end component;

	signal s_adderCarry : std_logic; -- does nothing, just for port mapping.

	-- Shift left 2
	component ShiftLeft2_N is
		generic(in_N : integer := 32;
				out_N: integer := 32);
		port (	i_input : in std_logic_vector(in_N - 1 downto 0);
				o_out : out std_logic_vector(out_N - 1 downto 0));
	end component;

	signal s_shiftedJump : std_logic_vector(27 downto 0);	-- jump immediate shifted by 2
	signal s_jumpAddr 	 : std_logic_vector(31 downto 0);	-- final jump address: { PC+4[31-28], inst[25-0], "00"}
	signal s_shiftedBranch: std_logic_vector(31 downto 0);	-- branch immediate shifted by 2
	signal s_branchAddr  : std_logic_vector(31 downto 0);	-- final branch address: PC+4 + shifted branch immediate
	signal s_branchCarry : std_logic; 						-- does nothing. Has the value of the carry out of branch adder.

	signal s_zeroMuxOut  : std_logic; -- output of the zeroMux. Is 1 if zero and beq OR notZero and bne.
	signal s_branchPC	 : std_logic_vector(31 downto 0); 	-- new value of PC from branchMux. Either PC+4 (s_newPC) or s_branchAddr
	signal s_executeBranch: std_logic; 					  -- signal for branchMux. Found by ANDing the zero and branch select line. 


begin

  -- TODO: This is required to be your final input to your instruction memory. This provides a feasible method to externally load the memory module which means that the synthesis tool must assume it knows nothing about the values stored in the instruction memory. If this is not included, much, if not all of the design is optimized out because the synthesis tool will believe the memory to be all zeros.
  with iInstLd select
    s_IMemAddr <= s_NextInstAddr when '0',
      iInstAddr when others;

	PC : PC_reg
		port map (	i_data => s_PCin,
					i_writeEn => '1',
					i_reset => iRST,
					i_clock => iCLK,
					o_output => s_NextInstAddr);

	PC_adder : ripple_carry_adder
		port map (	i_X => s_NextInstAddr,
					i_Y => x"00000004",
					i_C => '0',
					o_S => s_newPC,
					o_C => s_adderCarry);

	jumpShift : ShiftLeft2_N
		generic map	(in_N => 26,
					 out_N => 28)
		port map (	 i_input => s_Inst(25 downto 0),
					 o_out => s_shiftedJump);

	s_jumpAddr <= (s_newPC(31 downto 28) & s_shiftedJump);

	jumpMux : mux2t1_N
		generic map	(N => 32)
		port map 	(i_S => s_jumpSelect,
					 i_D0 => s_branchPC,
					 i_D1 => s_jumpAddr,
					 o_O => s_jumpMuxOut);  -- s_jumpMuxOut

	-- if jr, PC input is R[rs]
	jrMux : mux2t1_N
		generic map	(N => 32)
		port map 	(i_S => s_jrSelect,		-- s_jrSelect
					 i_D0 => s_jumpMuxOut,
					 i_D1 => s_regRS,
					 o_O => s_PCin);

	IMem: mem
	  	generic map(ADDR_WIDTH => ADDR_WIDTH,
	              	DATA_WIDTH => N)
	  	port map(clk  => iCLK,
	          	 addr => s_IMemAddr(11 downto 2),
	          	 data => iInstExt,
	         	 we   => iInstLd,
	          	 q    => s_Inst);
  
  	DMem: mem
    	generic map(ADDR_WIDTH => ADDR_WIDTH,
                	DATA_WIDTH => N)
    	port map(clk  => iCLK,
             	addr => s_DMemAddr(11 downto 2),
             	data => s_DMemData,
             	we   => s_DMemWr,
             	q    => s_DMemOut);

	byteSelect : mux4t1_N
		generic map (N => 8)
		port map (	i_S => s_DMemAddr(1 downto 0),
					i_D0 => s_DMemOut(7 downto 0),
					i_D1 => s_DMemOut(15 downto 8),
					i_D2 => s_DMemOut(23 downto 16),
					i_D3 => s_DMemOut(31 downto 24),
					o_O => s_loadByte);

	byteExtender : extender8t32
		port map (	i_signSelect => s_signedLoad,
					i_imm => s_loadByte,
					o_out => s_byteExtend);

	halfwordSelect : mux2t1_N
		generic map (N => 16)
		port map (	i_S => s_DMemAddr(1),
					i_D0 => s_DMemOut(15 downto 0),
					i_D1 => s_DMemOut(31 downto 16),
					o_O => s_loadHalf);

	halfwordExtend : extender_16to32
		port map ( 	i_signSelect => s_signedLoad,
				 	i_imm => s_loadHalf,
					o_out => s_halfExtend);

	
	memToRegMux : mux4t1_N
		generic map (N => 32)
		port map (	i_S => s_memToReg,
					i_D0 => s_ALUout,
					i_D1 => s_DMemOut,
					i_D2 => s_halfExtend,
					i_D3 => s_byteExtend,
					o_O => s_memToRegValue);


	regDstMux : mux4t1_N
		generic map (N => 5)
		port map ( 	i_S => s_regDst,
					i_D0 => s_Inst(20 downto 16),
					i_D1 => s_Inst(15 downto 11),
					i_D2 => "11111",   				-- reg 31 for jal
					i_D3 => "00000",
					o_O => s_RegWrAddr);


	reg_file : regFile
		port map (	i_rt => s_Inst(20 downto 16),
					i_rs => s_Inst(25 downto 21),
					i_rd => s_RegWrAddr,
					i_RegWrite => s_RegWr,
					i_data => s_RegWrData,
					i_clk => iCLK,
					i_rst => iRST,
					o_rt => s_regRT,
					o_rs => s_regRS);

	s_DMemData <= s_regRT; -- Data input to DMem is reg rt value

	ImmediateSignExtender : extender_16to32
		port map ( 	i_signSelect => s_extendSelect,
					i_imm => s_Inst(15 downto 0),
					o_out => s_extendedImm);

	SrcMux : mux2t1_N
		generic map (N => 32)
		port map (	i_S => s_ALUSrc,
					i_D0 => s_regRT,
					i_D1 => s_extendedImm,
					o_O => s_ALUinB);

	ALU : ALU_full
		port map (	i_A => s_regRS,
					i_B => s_ALUinB,
					ALUControl => s_ALUControl,
					i_shamt => s_Inst(10 downto 6),
					i_regShift => s_regShift,
					o_out => s_ALUout,
					o_OvF => s_AdderOvFl,
					o_zero => s_ALUzero);

	oALUOut <= s_ALUout;

	s_DMemAddr <= s_ALUout; -- D Mem Addr input is ALU result

	s_Ovfl <= (s_checkAddiOvF OR s_checkAddSubOvF) AND s_AdderOvFl; -- returns overflow for only ADD, SUB, and ADDI instructions

	control : ControlUnit
		port map (	i_opcode => s_Inst(31 downto 26),
					o_RegDst => s_regDst,
					o_Jump => s_jumpSelect,
					o_Branch => s_branchSelect,
					o_MemToReg => s_memToReg,
					o_ALUOp => s_ALUOp,
					o_MemWrite => s_DMemWr,
					o_ALUSrc => s_ALUSrc,
					o_RegWrite => s_RegWr,
					o_SignExt => s_extendSelect,
					o_Halt => s_Halt,
					o_luiSelect => s_luiSelect,
					o_checkOvFl => s_checkAddiOvF,
					o_SignedLoad => s_signedLoad,
					o_equalSelect => s_equalSelect);

	ALU_Control : ALUController
		port map (	i_Function => s_Inst(5 downto 0),
					i_ALUOp => s_ALUOp,
					o_ALUControl => s_ALUControl,
					o_checkOvFl => s_checkAddSubOvF,
					o_jrSelect => s_jrSelect,
					o_regShift => s_regShift);

	s_luiLoad <= (s_Inst(15 downto 0) & x"0000"); -- lui data should be [immediate,16'b0]

	-- select 1 if inst is lui and reg write should be the immediate appended with 0x0000
	luiMux : mux4t1_N
		generic map (N => 32)
		port map (	i_S => s_luiSelect,
					i_D0 => s_memToRegValue,
					i_D1 => s_luiLoad,
					i_D2 => s_newPC,		-- store value of PC+4 in reg 31 for jal
					i_D3 => x"00000000",  	-- unused
					o_O => s_RegWrData);


	-- branch path
	branchShift : ShiftLeft2_N
		generic map	(in_N => 32,
					 out_N => 32)
		port map (	 i_input => s_extendedImm,
					 o_out => s_shiftedBranch);

	branch_adder : ripple_carry_adder
		port map (	i_X => s_shiftedBranch,
					i_Y => s_newPC,
					i_C => '0',
					o_S => s_branchAddr,
					o_C => s_branchCarry);

	s_notZero <= NOT s_ALUzero;
	
	zeroMux : mux2t1_dataflow
		port map (	i_S => s_equalSelect,
					i_D0 => s_notZero,
					i_D1 => s_ALUzero,
					o_O =>  s_zeroMuxOut);

	s_executeBranch <= s_zeroMuxOut AND s_branchSelect;

	branchMux : mux2t1_N
		port map (	i_S => s_executeBranch,
					i_D0 => s_newPC,
					i_D1 => s_branchAddr,
					o_O => s_branchPC);

	

end structure;

--