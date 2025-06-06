.data
arr: .word 1, 2, 0, 5, 4, 3, 6, 7, 9, 8
.text
.global main
main:
    # Testing add
    add $t0, $t1, $t2      

    # Testing addi
    addi $t3, $t4, 10    
    
    # Testing addiu
    addiu $t5, $t6, 20   
    
    # Testing addu
    addu $t7, $t8, $t9    
    nop
    nop
    nop
    
    # Testing sub
    sub $t4, $t5, $t6      
    nop
    nop
    nop
    
    # Testing subu
    subu $t7, $t8, $t9   
    nop
    nop
    nop  
    
    # Testing slt
    slt $t8, $t9, $t0      
    nop
    nop
    nop
    
    # Testing slti
    slti $t1, $t2, 100     
    nop
    nop
    nop

    # Testing and
    and $t0, $t1, $t2      
    nop
    nop
    nop
    
    # Testing andi
    andi $t3, $t4, 0xFF 
    nop
    nop
    nop   
    
    # Testing nor
    nor $t5, $t6, $t7 
    nop
    nop
    nop     
    
    # Testing or
    or $t8, $t9, $t0      
    nop
    nop
    nop 
    
    # Testing ori
    ori $t1, $t2, 0x0F 
    nop
    nop
    nop    
    
    # Testing xor
    xor $t0, $t1, $t2     
    nop
    nop
    nop 
    
    # Testing xori
    xori $t3, $t4, 0xFF  
    nop
    nop
    nop  

    # Testing sll
    sll $t3, $t4, 2        
    nop
    nop
    nop
    
    # Testing sllv
    sllv $t5, $t6, $t7     
    nop
    nop
    nop
    
    # Testing sra
    sra $t3, $t4, 2 
    nop
    nop
    nop       
    
    # Testing srav
    srav $t5, $t6, $t7 
    nop
    nop
    nop    
    
    # Testing srl
    srl $t8, $t9, 2    
    nop
    nop
    nop    
    
    # Testing srlv
    srlv $t1, $t2, $t3 
    nop
    nop
    nop   

    # Testing beq
    bne $t0, $t1, label1     # Branch to 'exit' if $t0 == $t1
    nop
    nop
    nop

label1: 
    nop
    nop
    nop
    addiu $t1, $t1, 1

label2:
    # Testing bne
    beq $t0, $t1, exit     # Branch to 'exit' if $t0 != $t1
    nop
    nop
    nop

    # Testing jal
    jal my_function        # Jump and link to a subroutine
    nop
    nop
    nop

    lasw $t1, arr
    nop
    nop
    nop
    # Testing lb
    lb $t0, 0($t1)         # Load byte from memory
    nop
    nop
    nop

    addiu $t3, $t1, 4
    nop
    nop
    nop
    # Testing lbu
    lbu $t2, 0($t3)        # Load unsigned byte

    addiu $t5, $t1, 0
    nop
    nop
    nop
    # Testing lh
    lh $t4, 0($t5)         # Load halfword
    nop
    nop
    nop

    addiu $t7, $t1, 0
    nop
    nop
    nop
    # Testing lhu
    lhu $t6, 0($t7)        # Load unsigned halfword
    nop
    nop
    nop

    # Testing lui
    lui $t1, 0x1234        # Load upper immediate
    nop
    nop
    nop

    # Testing lw
    lw $t2, 0($t3)         # Load word
    nop
    nop
    nop

    # Testing sw
    sw $t4, 0($t5)         # Store word
    nop
    nop
    nop


    # Testing j
    j exit                 # Unconditional jump to 'exit'

my_function:
    # Dummy function body
    nop
    nop
    nop
    jr $ra                 # Return to caller 
    nop
    nop
    nop


exit:
    halt

